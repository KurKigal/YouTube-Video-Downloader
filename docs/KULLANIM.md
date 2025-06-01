# 🎬 YouTube Video Downloader - Kullanım Kılavuzu

## 📋 İçindekiler

1. [Kurulum](#kurulum)
2. [İlk Çalıştırma](#ilk-çalıştırma)
3. [Extension Yükleme](#extension-yükleme)
4. [Video İndirme](#video-i̇ndirme)
5. [Sorun Giderme](#sorun-giderme)
6. [SSS](#sss)

---

## 🛠️ Kurulum

### Otomatik Kurulum (Önerilen)

```bash
# Projeyi indirin ve klasöre girin
cd YouTubeVideoDownloader

# Kurulum scriptini çalıştırın
chmod +x scripts/install.sh
./scripts/install.sh
```

### Manuel Kurulum

**Gereksinimler:**
- Python 3.7+
- FFmpeg
- İnternet bağlantısı

**Adımlar:**

1. **Python paketlerini kurun:**
```bash
pip3 install flask flask-cors yt-dlp
```

2. **FFmpeg kurun:**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS (Homebrew)
brew install ffmpeg
```

---

## 🚀 İlk Çalıştırma

### 1. Backend'i Başlatın

```bash
./scripts/start.sh
```

**Başarılı çalışma göstergeleri:**
- ✅ `Virtual environment aktifleştirildi`
- ✅ `FFmpeg bulundu: /usr/bin/ffmpeg`
- ✅ `Server: http://127.0.0.1:5000`
- ✅ `Running on http://127.0.0.1:5000`

### 2. Health Check

Tarayıcınızda şu adresi açın: http://127.0.0.1:5000/health

Şöyle bir yanıt görmeli:
```json
{
  "status": "healthy",
  "ffmpeg_available": true,
  "active_downloads": 0
}
```

---

## 🧩 Extension Yükleme

### Chrome/Chromium

1. **Developer Mode'u aktifleştirin:**
   - Chrome'da `chrome://extensions/` açın
   - Sağ üstte "Developer mode" açın

2. **Extension'ı yükleyin:**
   - "Load unpacked" tıklayın
   - `extension/` klasörünü seçin
   - Extension listesinde görünecek

### Firefox

1. **about:debugging** sayfasını açın
2. **"This Firefox"** tıklayın
3. **"Load Temporary Add-on"** tıklayın
4. `extension/manifest.json` dosyasını seçin

### Doğrulama

Extension başarıyla yüklenirse:
- Tarayıcı toolbar'ında 📺 ikonu görünür
- YouTube sayfalarında "Video İndir" butonu eklenir

---

## 🎯 Video İndirme

### Yöntem 1: YouTube Sayfasından

1. **YouTube'da video açın**
2. **"Video İndir" butonuna tıklayın** (video altında)
3. **Format seçin:**
   - 720p HD (video+ses)
   - 480p (video+ses)
   - 360p (video+ses)
   - En İyi Ses (MP3)
4. **"İndir" butonuna tıklayın**
5. **İndirme durumunu takip edin**

### Yöntem 2: Extension Popup'ından

1. **Extension ikonuna tıklayın** (📺)
2. **Video URL'sini yapıştırın**
3. **"Video Bilgisi Al" tıklayın**
4. **Format seçip indirin**

### İndirme Konumu

Tüm videolar şu klasöre indirilir:
```
~/Downloads/VideoDownloader/
```

### Desteklenen Formatlar

**Video Formatları:**
- MP4 (720p, 480p, 360p)
- Video + Ses kombinasyonu

**Ses Formatları:**
- MP3 (192 kbps)
- En iyi ses kalitesi

---

## 🔧 Sorun Giderme

### Yaygın Sorunlar

#### 1. "Connection refused" Hatası

**Sebep:** Backend çalışmıyor
**Çözüm:**
```bash
./scripts/start.sh
# Health check: http://127.0.0.1:5000/health
```

#### 2. "FFmpeg not found" Hatası

**Sebep:** FFmpeg kurulu değil
**Çözüm:**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Test
ffmpeg -version
```

#### 3. YouTube "Bot Protection" Hatası

**Sebep:** YouTube bot koruması
**Çözüm:**
- Farklı video deneyin
- Birkaç dakika bekleyin
- yt-dlp güncelleyin: `pip3 install --upgrade yt-dlp`

#### 4. Extension Görünmüyor

**Sebep:** Extension yüklenmemiş
**Çözüm:**
- Chrome: `chrome://extensions/` kontrol edin
- Firefox: `about:addons` kontrol edin
- Extension'ı yeniden yükleyin

#### 5. İndirme Çok Yavaş

**Sebep:** İnternet bağlantısı veya YouTube sınırlaması
**Çözüm:**
- Düşük kalite seçin
- Başka zaman deneyin
- VPN kullanın (opsiyonel)

### Log Kontrolü

Backend loglarını kontrol edin:
```bash
# Backend çalışırken terminal çıktısını izleyin
# Hata mesajları için kırmızı renkli satırları kontrol edin
```

### Debug Modu

Daha detaylı log için:
```bash
cd backend
python3 app.py  # Debug mode otomatik aktif
```

---

## ❓ SSS (Sık Sorulan Sorular)

### Genel Sorular

**S: Hangi siteleri destekliyor?**
A: YouTube, Instagram, TikTok, Facebook ve [yt-dlp'nin desteklediği tüm siteler](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

**S: Telif hakkı sorunu var mı?**
A: Sadece kendi içeriğinizi veya izin verilen içerikleri indirin. Telif hakkı yasalarına uyun.

**S: İnternetsiz çalışır mı?**
A: Hayır, video indirme için internet bağlantısı gereklidir.

**S: Mobil cihazlarda çalışır mı?**
A: Hayır, şu anda sadece masaüstü bilgisayarlarda çalışır.

### Teknik Sorular

**S: Port 5000 kullanımda hatası?**
A: Başka bir uygulama 5000 portunu kullanıyor. Backend'i farklı port ile başlatın:
```bash
cd backend
python3 -c "
import app
app.app.run(host='127.0.0.1', port=5001)
"
```

**S: Python 2 kullanabilir miyim?**
A: Hayır, Python 3.7+ gereklidir.

**S: Virtual environment zorunlu mu?**
A: Zorunlu değil ama önerilir. Sistem paketlerini kirletmez.

### İndirme Sorunları

**S: MP3 dönüştürme çalışmıyor?**
A: FFmpeg'in doğru kurulduğundan emin olun:
```bash
ffmpeg -version
ffprobe -version
```

**S: 4K video indirebilir miyim?**
A: Evet, ama format listesinde mevcut olması gerekir. YouTube'un sınırlamaları olabilir.

**S: Playlist indirebilir miyim?**
A: Şu anda tek video desteklenir. Playlist desteği gelecek sürümlerde eklenecek.

**S: İndirme hızı nasıl artırılır?**
A: İnternet hızınıza bağlıdır. YouTube'un da hız sınırlamaları vardır.

---

## 📞 Destek

**Sorun bildirimi için:**
1. Hangi işletim sistemi kullandığınızı belirtin
2. Hata mesajının tam metnini paylaşın
3. Backend loglarını ekleyin
4. Hangi video URL'sini kullandığınızı belirtin

**Önemli dosyalar:**
- Backend log: Terminal çıktısı
- Extension log: Browser console (F12)
- Health check: http://127.0.0.1:5000/health

---

## 🔄 Güncelleme

Yeni sürüm için:
```bash
# Eski sürümü yedekleyin
cp -r YouTubeVideoDownloader YouTubeVideoDownloader-backup

# Yeni sürümü indirin ve kurulum yapın
./scripts/install.sh
```

---

## ⚖️ Yasal Uyarı

Bu araç sadece eğitim amaçlıdır. Kullanıcılar telif hakkı yasalarına uymakla yükümlüdür. Sadece sahip olduğunuz veya indirme izni olan içerikleri indirin.
