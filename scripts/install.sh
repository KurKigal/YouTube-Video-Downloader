#!/bin/bash

# YouTube Video Downloader - Otomatik Kurulum Scripti
# Bu script tüm gerekli bileşenleri otomatik olarak kurar

set -e  # Hata durumunda çık

echo "🚀 YouTube Video Downloader Kurulumu Başlatılıyor..."
echo "=================================================="

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonu
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# İşletim sistemi kontrolü
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt &> /dev/null; then
            OS="ubuntu"
        elif command -v yum &> /dev/null; then
            OS="centos"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
    
    log_info "İşletim sistemi tespit edildi: $OS"
}

# Python kontrolü ve kurulumu
install_python() {
    log_info "Python kurulumu kontrol ediliyor..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d " " -f 2)
        log_success "Python3 zaten kurulu: $PYTHON_VERSION"
    else
        log_warning "Python3 bulunamadı, kuruluyor..."
        
        case $OS in
            "ubuntu")
                sudo apt update
                sudo apt install -y python3 python3-pip python3-venv
                ;;
            "centos")
                sudo yum install -y python3 python3-pip
                ;;
            "macos")
                if command -v brew &> /dev/null; then
                    brew install python3
                else
                    log_error "Homebrew bulunamadı. Lütfen önce Homebrew kurun: https://brew.sh"
                    exit 1
                fi
                ;;
            *)
                log_error "Desteklenmeyen işletim sistemi. Lütfen Python3'ü manuel olarak kurun."
                exit 1
                ;;
        esac
        
        log_success "Python3 kurulumu tamamlandı"
    fi
}

# FFmpeg kurulumu
install_ffmpeg() {
    log_info "FFmpeg kurulumu kontrol ediliyor..."
    
    if command -v ffmpeg &> /dev/null; then
        FFMPEG_VERSION=$(ffmpeg -version | head -n1 | cut -d " " -f 3)
        log_success "FFmpeg zaten kurulu: $FFMPEG_VERSION"
    else
        log_warning "FFmpeg bulunamadı, kuruluyor..."
        
        case $OS in
            "ubuntu")
                sudo apt update
                sudo apt install -y ffmpeg
                ;;
            "centos")
                sudo yum install -y epel-release
                sudo yum install -y ffmpeg
                ;;
            "macos")
                if command -v brew &> /dev/null; then
                    brew install ffmpeg
                else
                    log_error "Homebrew bulunamadı. FFmpeg kurulamadı."
                    exit 1
                fi
                ;;
            *)
                log_error "Desteklenmeyen işletim sistemi. Lütfen FFmpeg'i manuel olarak kurun."
                exit 1
                ;;
        esac
        
        log_success "FFmpeg kurulumu tamamlandı"
    fi
}

# Python paketlerini kur
install_python_packages() {
    log_info "Python paketleri kuruluyor..."
    
    # Virtual environment oluştur
    python3 -m venv venv
    source venv/bin/activate
    
    # Paketleri kur
    pip install --upgrade pip
    pip install flask flask-cors yt-dlp
    
    log_success "Python paketleri kuruldu"
}

# Proje dosyalarını ayarla
setup_project() {
    log_info "Proje dosyaları ayarlanıyor..."
    
    # İndirme klasörü oluştur
    DOWNLOAD_DIR="$HOME/Downloads/VideoDownloader"
    mkdir -p "$DOWNLOAD_DIR"
    
    # Desktop shortcut oluştur (Linux için)
    if [[ "$OS" == "ubuntu" ]]; then
        DESKTOP_FILE="$HOME/Desktop/YouTube-Video-Downloader.desktop"
        cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=YouTube Video Downloader
Comment=Video indirme uygulaması
Exec=$PWD/start.sh
Icon=$PWD/icon.png
Terminal=true
Categories=AudioVideo;
EOF
        chmod +x "$DESKTOP_FILE"
        log_success "Masaüstü kısayolu oluşturuldu"
    fi
    
    log_success "Proje dosyaları ayarlandı"
}

# Ana kurulum fonksiyonu
main() {
    echo
    log_info "Kuruluma başlanıyor..."
    echo
    
    detect_os
    install_python
    install_ffmpeg
    install_python_packages
    setup_project
    
    echo
    echo "🎉 Kurulum Tamamlandı!"
    echo "===================="
    echo
    echo "📁 İndirme klasörü: $HOME/Downloads/VideoDownloader"
    echo "🚀 Uygulamayı başlatmak için: ./start.sh"
    echo "📖 Kullanım kılavuzu: ./docs/KULLANIM.md"
    echo
    echo "🌐 Tarayıcınızda extension'ı yükledikten sonra kullanabilirsiniz!"
    echo
}

# Script'i çalıştır
main
