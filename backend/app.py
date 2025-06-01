import os
import json
import uuid
import threading
import time
import subprocess
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)

# İndirme klasörü
DOWNLOAD_DIR = os.path.expanduser("~/Downloads/VideoDownloader")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Aktif indirmeler
active_downloads = {}

def find_ffmpeg_path():
    """FFmpeg yolunu bul"""
    possible_paths = [
        '/usr/bin/ffmpeg',
        '/usr/local/bin/ffmpeg',
        'ffmpeg'  # PATH'te varsa
    ]
    
    for path in possible_paths:
        try:
            result = subprocess.run([path, '-version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print(f"✅ FFmpeg bulundu: {path}")
                return path
        except:
            continue
    
    print("❌ FFmpeg bulunamadı!")
    return None

# FFmpeg yolunu bul
FFMPEG_PATH = find_ffmpeg_path()

# YouTube bot koruması için gelişmiş yt-dlp ayarları
def get_ydl_opts(format_selector='best', include_progress_hook=None):
    """Gelişmiş yt-dlp seçenekleri"""
    opts = {
        'format': format_selector,
        'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
        'quiet': False,
        'no_warnings': False,
        'extract_flat': False,
        
        # FFmpeg yolu
        'ffmpeg_location': FFMPEG_PATH,
        
        # YouTube bot koruması için
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'referer': 'https://www.youtube.com/',
        
        # Ek güvenlik ayarları
        'http_headers': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
            'Keep-Alive': '300',
            'Connection': 'keep-alive',
        },
        
        # Rate limiting
        'sleep_interval': 1,
        'max_sleep_interval': 5,
        
        # Retry ayarları
        'retries': 3,
        'fragment_retries': 3,
    }
    
    if include_progress_hook:
        opts['progress_hooks'] = [include_progress_hook]
    
    return opts

def get_simple_formats():
    """YouTube erişimi yoksa basit formatlar döndür"""
    return [
        {
            'format_id': 'best[height<=720]',
            'quality': '720p HD',
            'type': 'video+audio',
            'ext': 'mp4'
        },
        {
            'format_id': 'best[height<=480]',
            'quality': '480p',
            'type': 'video+audio',
            'ext': 'mp4'
        },
        {
            'format_id': 'worst[height>=240]',
            'quality': '360p',
            'type': 'video+audio',
            'ext': 'mp4'
        },
        {
            'format_id': 'bestaudio',
            'quality': 'En İyi Ses (MP3)',
            'type': 'audio',
            'ext': 'mp3'
        }
    ]

@app.route('/health', methods=['GET'])
def health_check():
    """Sağlık kontrolü"""
    return jsonify({
        'status': 'healthy',
        'active_downloads': len(active_downloads),
        'download_dir': DOWNLOAD_DIR,
        'yt_dlp_version': yt_dlp.version.__version__,
        'ffmpeg_available': FFMPEG_PATH is not None,
        'ffmpeg_path': FFMPEG_PATH
    })

@app.route('/video-info', methods=['POST'])
def get_video_info():
    """Video bilgilerini al"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL gerekli'}), 400
        
        print(f"🔍 Video bilgisi çekiliyor: {url}")
        
        # yt-dlp ile video bilgilerini al
        ydl_opts = get_ydl_opts('best')
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                print(f"✅ Video bilgisi alındı: {info.get('title', 'Başlıksız')}")
                
                # Video bilgilerini düzenle
                video_info = {
                    'title': info.get('title', 'Başlık bulunamadı'),
                    'uploader': info.get('uploader', 'Bilinmiyor'),
                    'duration': info.get('duration', 0),
                    'view_count': info.get('view_count', 0),
                    'upload_date': info.get('upload_date', ''),
                    'description': info.get('description', ''),
                    'thumbnail': info.get('thumbnail', ''),
                    'webpage_url': info.get('webpage_url', url)
                }
                
                # Basit formatları kullan (YouTube bot koruması nedeniyle)
                formats = get_simple_formats()
                
                return jsonify({
                    'video_info': video_info,
                    'formats': formats
                })
                
        except Exception as video_info_error:
            print(f"⚠️ Video info hatası (muhtemelen bot koruması): {video_info_error}")
            
            # YouTube bot koruması durumunda basit bilgiler döndür
            video_info = {
                'title': 'YouTube Video',
                'uploader': 'YouTube',
                'duration': 0,
                'view_count': 0,
                'upload_date': '',
                'description': 'Video bilgileri alınamadı (bot koruması)',
                'thumbnail': '',
                'webpage_url': url
            }
            
            formats = get_simple_formats()
            
            return jsonify({
                'video_info': video_info,
                'formats': formats
            })
    
    except Exception as e:
        print(f"❌ Video bilgisi alma hatası: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['POST'])
def start_download():
    """Video indirmeyi başlat"""
    try:
        data = request.get_json()
        url = data.get('url')
        format_id = data.get('format_id', 'best[height<=720]')
        quality = data.get('quality', 'En İyi Kalite')
        
        if not url:
            return jsonify({'error': 'URL gerekli'}), 400
        
        # FFmpeg kontrolü
        if format_id == 'bestaudio' and not FFMPEG_PATH:
            return jsonify({'error': 'MP3 dönüştürme için FFmpeg gerekli. Lütfen FFmpeg yükleyin.'}), 400
        
        # Benzersiz indirme ID'si oluştur
        download_id = str(uuid.uuid4())
        
        print(f"🚀 İndirme başlatılıyor: {download_id}")
        print(f"📺 URL: {url}")
        print(f"🎬 Format: {format_id} ({quality})")
        
        # İndirme bilgilerini kaydet
        active_downloads[download_id] = {
            'status': 'başlatıldı',
            'progress': 0,
            'url': url,
            'format_id': format_id,
            'quality': quality,
            'start_time': datetime.now(),
            'filename': '',
            'error': None
        }
        
        def progress_hook(d):
            """Progress callback fonksiyonu"""
            try:
                if download_id not in active_downloads:
                    return
                
                status = d['status']
                
                if status == 'downloading':
                    downloaded_bytes = d.get('downloaded_bytes', 0)
                    total_bytes = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
                    
                    if total_bytes > 0:
                        progress = (downloaded_bytes / total_bytes) * 100
                    else:
                        progress = 50  # Tahmini progress
                    
                    filename = d.get('filename', '').split('/')[-1] if d.get('filename') else 'İndiriliyor...'
                    
                    active_downloads[download_id].update({
                        'status': 'indiriliyor',
                        'progress': round(progress, 1),
                        'filename': filename
                    })
                    
                    print(f"📥 İndiriliyor: {progress:.1f}% - {filename}")
                    
                elif status == 'finished':
                    filename = d.get('filename', '').split('/')[-1] if d.get('filename') else 'Tamamlandı'
                    
                    active_downloads[download_id].update({
                        'status': 'tamamlandı',
                        'progress': 100,
                        'filename': filename
                    })
                    
                    print(f"✅ İndirme tamamlandı: {filename}")
                    
                elif status == 'error':
                    error_msg = str(d.get('error', 'Bilinmeyen hata'))
                    active_downloads[download_id].update({
                        'status': 'hata',
                        'error': error_msg
                    })
                    print(f"❌ İndirme hatası: {error_msg}")
                    
            except Exception as e:
                print(f"❌ Progress hook hatası: {e}")
        
        def download_thread():
            try:
                print(f"🔧 İndirme thread'i başlatıldı: {download_id}")
                
                # İndirme klasörünü oluştur
                os.makedirs(DOWNLOAD_DIR, exist_ok=True)
                
                # yt-dlp seçenekleri
                ydl_opts = get_ydl_opts(format_id, progress_hook)
                
                # Ses indirme için özel ayarlar
                if format_id == 'bestaudio' or 'MP3' in quality:
                    print(f"🎵 MP3 dönüştürme için FFmpeg kullanılıyor: {FFMPEG_PATH}")
                    ydl_opts.update({
                        'format': 'bestaudio/best',
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': 'mp3',
                            'preferredquality': '192',
                        }],
                        'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
                    })
                
                print(f"🔧 yt-dlp format seçeneği: {ydl_opts['format']}")
                print(f"🔧 FFmpeg yolu: {ydl_opts.get('ffmpeg_location', 'Yok')}")
                
                # İndirme durumunu güncelle
                active_downloads[download_id]['status'] = 'indiriliyor'
                active_downloads[download_id]['progress'] = 10
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    print(f"📥 İndirme başlatılıyor...")
                    ydl.download([url])
                    
                # Manuel tamamlanma kontrolü
                if download_id in active_downloads and active_downloads[download_id]['status'] != 'tamamlandı':
                    active_downloads[download_id].update({
                        'status': 'tamamlandı',
                        'progress': 100,
                        'filename': 'Video başarıyla indirildi'
                    })
                    print(f"✅ İndirme manuel olarak tamamlandı olarak işaretlendi")
                    
            except Exception as e:
                error_msg = str(e)
                print(f"❌ İndirme thread hatası: {error_msg}")
                if download_id in active_downloads:
                    active_downloads[download_id].update({
                        'status': 'hata',
                        'error': error_msg,
                        'progress': 0
                    })
        
        # İndirmeyi ayrı thread'de başlat
        thread = threading.Thread(target=download_thread)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'download_id': download_id,
            'status': 'başlatıldı'
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ İndirme başlatma hatası: {error_msg}")
        return jsonify({'error': error_msg}), 500

@app.route('/download-status/<download_id>', methods=['GET'])
def get_download_status(download_id):
    """İndirme durumunu al"""
    if download_id not in active_downloads:
        return jsonify({'error': 'İndirme bulunamadı'}), 404
    
    return jsonify(active_downloads[download_id])

if __name__ == '__main__':
    print(f"🚀 Video İndirici Backend başlatılıyor...")
    print(f"📁 İndirme klasörü: {DOWNLOAD_DIR}")
    print(f"🌐 Server: http://127.0.0.1:5000")
    print(f"🎬 FFmpeg durumu: {'✅ Mevcut' if FFMPEG_PATH else '❌ Bulunamadı'}")
    if FFMPEG_PATH:
        print(f"📍 FFmpeg yolu: {FFMPEG_PATH}")
    
    app.run(host='127.0.0.1', port=5000, debug=True)
