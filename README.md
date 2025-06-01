# 🎬 YouTube Video Downloader

Modern, kullanıcı dostu video indirme aracı. Browser extension + Python backend ile YouTube ve diğer platformlardan video indirin.

## ✨ Özellikler

- 🎯 **Kolay Kullanım**: YouTube sayfasında tek tık ile indirme
- 📱 **Browser Extension**: Chrome/Firefox desteği
- 🎬 **Çoklu Format**: MP4 (720p/480p/360p) + MP3 ses
- ⚡ **Hızlı İndirme**: Optimized yt-dlp backend
- 📊 **İndirme Takibi**: Gerçek zamanlı progress bar
- 🔒 **Güvenli**: Lokal çalışır, veri gönderilmez
- 🎨 **Modern UI**: Şık ve responsive tasarım

## 🚀 Hızlı Başlangıç

```bash
# 1. Projeyi indirin
git clone https://github.com/your-username/youtube-video-downloader.git
cd youtube-video-downloader

# 2. Otomatik kurulum
chmod +x scripts/install.sh
./scripts/install.sh

# 3. Uygulamayı başlatın
./scripts/start.sh
```

## 📋 Gereksinimler

- **İşletim Sistemi**: Linux, macOS
- **Python**: 3.7+
- **FFmpeg**: Video/ses işleme için
- **Browser**: Chrome/Firefox (Extension için)

## 📦 Kurulum

### Otomatik Kurulum (Önerilen)

```bash
./scripts/install.sh
```

Bu script otomatik olarak kurar:
- Python dependencies
- FFmpeg
- Virtual environment
- Desktop shortcuts

### Manuel Kurulum

```bash
# Python paketleri
pip3 install flask flask-cors yt-dlp

# FFmpeg (Ubuntu/Debian)
sudo apt install ffmpeg

# FFmpeg (macOS)
brew install ffmpeg
```

## 🎯 Kullanım

### 1. Backend'i Başlatın

```bash
./scripts/start.sh
```

### 2. Extension'ı Yükleyin

**Chrome:**
1. `chrome://extensions/` açın
2. "Developer mode" aktifleştirin
3. "Load unpacked" → `extension/` klasörü seçin

**Firefox:**
1. `about:debugging` açın
2. "Load Temporary Add-on" → `extension/manifest.json`

### 3. Video İndirin

1. YouTube'da video açın
2. "Video İndir" butonuna tıklayın
3. Format seçin (720p/480p/360p/MP3)
4. İndirin!

## 📸 Ekran Görüntüleri

### Extension Popup
```
┌─────────────────────────────┐
│  📺 Video Downloader        │
├─────────────────────────────┤
│ URL: [youtube.com/watch...] │
│ [Video Bilgisi Al]          │
├─────────────────────────────┤
│ 📺 Video Title              │
│ 👤 Channel Name             │
│ ⏱️ 3:45                     │
├─────────────────────────────┤
│ Format Seçin:               │
│ ○ 720p HD                   │
│ ○ 480p                      │
│ ○ 360p                      │
│ ○ En İyi Ses (MP3)          │
│ [İndir]                     │
└─────────────────────────────┘
```

### YouTube Entegrasyonu
```
YouTube Video Sayfası
┌────────────────────────────────────┐
│ Video Player                       │
│ ████████████████████████████████   │
└────────────────────────────────────┘
│ Video Title                        │
│ 1M views • 2 days ago             │
│ [👍 Like] [👎] [📤 Share] [📺 Video İndir] │
```

## 🔧 API Endpoints

Backend REST API:

```
GET  /health                 # Sistem durumu
POST /video-info            # Video bilgilerini al
POST /download              # İndirme başlat
GET  /download-status/<id>  # İndirme durumu
```

## 📁 Proje Yapısı

```
YouTubeVideoDownloader/
├── backend/
│   └── app.py              # Flask backend
├── extension/
│   ├── manifest.json       # Extension config
│   ├── popup.html         # Extension popup
│   ├── popup.js           # Extension logic
│   ├── content.js         # YouTube integration
│   └── styles.css         # Styling
├── scripts/
│   ├── install.sh         # Auto installer
│   └── start.sh           # Start script
├── docs/
│   └── KULLANIM.md        # User manual
└── README.md              # This file
```

## 🌐 Desteklenen Siteler

yt-dlp sayesinde 1000+ site desteklenir:

- **Video**: YouTube, Vimeo, Dailymotion
- **Social**: Instagram, TikTok, Twitter
- **Live**: Twitch, YouTube Live
- **Daha fazlası**: [Tam liste](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## 🛡️ Güvenlik

- ✅ **Lokal çalışır**: Veriler sunucuya gönderilmez
- ✅ **Açık kaynak**: Kod tamamen görülebilir
- ✅ **İzin tabanlı**: Sadece istenen izinleri kullanır
- ✅ **Veri toplama yok**: Analytics/tracking yok

## 🔍 Sorun Giderme

### Yaygın Hatalar

**"Connection refused"**
```bash
# Backend başlatıldı mı kontrol edin
./scripts/start.sh
curl http://127.0.0.1:5000/health
```

**"FFmpeg not found"**
```bash
# FFmpeg kurulumu
sudo apt install ffmpeg
ffmpeg -version
```

**"Extension görünmüyor"**
- Chrome: `chrome://extensions/` kontrol
- Developer mode aktif mi?
- Extension enabled mi?

### Debug Mode

```bash
cd backend
python3 app.py  # Verbose logging
```

## 📊 Performans

**İndirme Hızları:**
- 720p Video: ~5-15 MB/s (internet hızına bağlı)
- MP3 Audio: ~1-3 MB/s
- Dönüştürme: FFmpeg performansına bağlı

**Sistem Gereksinimleri:**
- RAM: 512MB minimum
- Disk: İndirilen videolar için yer
- CPU: FFmpeg için modern işlemci önerilir

## 🤝 Katkıda Bulunma

```bash
# Fork & clone
git clone https://github.com/your-fork/youtube-video-downloader.git

# Feature branch oluştur
git checkout -b feature/amazing-feature

# Changes commit et
git commit -m "Add amazing feature"

# Push & PR oluştur
git push origin feature/amazing-feature
```

### Development Setup

```bash
# Development dependencies
pip3 install -r requirements-dev.txt

# Frontend development
cd extension/
# Browser'da live reload için extensions reloader kullan

# Backend development
cd backend/
python3 app.py  # Debug mode
```

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## ⚖️ Yasal Uyarı

Bu araç eğitim amaçlıdır. Kullanıcılar:
- Telif hakkı yasalarına uymakla yükümlüdür
- Sadece sahip oldukları içerikleri indirmelidir
- Platform kullanım şartlarını ihlal etmemelidir

## 📞 Destek & İletişim

- **Issues**: GitHub Issues kullanın
- **Discussions**: GitHub Discussions
- **Security**: Güvenlik sorunları için private mesaj

## 🙏 Teşekkürler

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video indirme motoru
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [FFmpeg](https://ffmpeg.org/) - Video/ses işleme

## 🔄 Changelog

### v1.0.0 (2024-12-XX)
- ✨ İlk stable release
- 🎯 YouTube extension entegrasyonu
- 🎬 Çoklu format desteği (MP4/MP3)
- ⚡ Real-time progress tracking
- 🔧 Otomatik kurulum scripti
- 📖 Comprehensive documentation

---

**⭐ Beğendiyseniz star vermeyi unutmayın!**
