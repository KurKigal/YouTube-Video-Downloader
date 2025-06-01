#!/bin/bash

# YouTube Video Downloader - Başlatma Scripti

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "🎬 YouTube Video Downloader"
echo "=========================="
echo -e "${NC}"

# Virtual environment'ı aktifleştir
if [ -d "venv" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment aktifleştirildi${NC}"
else
    echo -e "${RED}❌ Virtual environment bulunamadı. Lütfen önce install.sh çalıştırın.${NC}"
    exit 1
fi

# Backend'i başlat
echo -e "${BLUE}🚀 Backend sunucusu başlatılıyor...${NC}"
echo

# İndirme klasörünü oluştur
DOWNLOAD_DIR="$HOME/Downloads/VideoDownloader"
mkdir -p "$DOWNLOAD_DIR"

echo -e "${GREEN}📁 İndirme klasörü: $DOWNLOAD_DIR${NC}"
echo -e "${GREEN}🌐 Server adresi: http://127.0.0.1:5000${NC}"
echo -e "${GREEN}📖 Extension yükleme: Chrome/Firefox extension'ını yükleyin${NC}"
echo
echo -e "${YELLOW}⏹️  Durdurmak için Ctrl+C tuşlayın${NC}"
echo

cd backend
python3 app.py
