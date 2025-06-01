// popup.js - Tam işlevli popup

let currentVideoUrl = null;
let selectedFormat = null;
let videoInfo = null;
let downloadId = null;
let progressInterval = null;

// Popup açıldığında
document.addEventListener('DOMContentLoaded', async () => {
    await initializePopup();
});

// Popup'ı başlat
async function initializePopup() {
    try {
        // Backend bağlantısını kontrol et
        const backendStatus = await checkBackendConnection();
        updateStatusBar(backendStatus);
        
        if (!backendStatus) {
            showError('Backend servisi çalışmıyor! Python server\'ını başlatın.');
            return;
        }
        
        // Mevcut video URL'sini al
        const currentUrl = await getCurrentVideoUrl();
        if (!currentUrl || !isVideoUrl(currentUrl)) {
            showNoVideo();
            return;
        }
        
        currentVideoUrl = currentUrl;
        
        // Video bilgilerini backend'den al
        await loadVideoInfo();
        
    } catch (error) {
        console.error('Popup başlatma hatası:', error);
        showError('Bir hata oluştu: ' + error.message);
    }
}

// Backend bağlantısını kontrol et
async function checkBackendConnection() {
    try {
        const response = await browser.runtime.sendMessage({
            action: 'checkBackend'
        });
        return response.success && response.connected;
    } catch (error) {
        return false;
    }
}

// Durum çubuğunu güncelle
function updateStatusBar(isConnected) {
    const statusBar = document.getElementById('status-bar');
    if (isConnected) {
        statusBar.textContent = '✅ Backend servisi çalışıyor';
        statusBar.className = 'status-bar status-connected';
    } else {
        statusBar.textContent = '❌ Backend servisi bağlanamıyor';
        statusBar.className = 'status-bar status-disconnected';
    }
}

// Mevcut video URL'sini al
async function getCurrentVideoUrl() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    return tab.url;
}

// Video URL kontrolü
function isVideoUrl(url) {
    return (
        url.includes('youtube.com/watch') ||
        url.includes('instagram.com/p/') ||
        url.includes('instagram.com/reel/') ||
        url.includes('instagram.com/tv/')
    );
}

// Video bilgilerini yükle
async function loadVideoInfo() {
    try {
        showLoading();
        
        const response = await browser.runtime.sendMessage({
            action: 'getVideoInfo',
            url: currentVideoUrl
        });
        
        if (!response.success) {
            throw new Error(response.error);
        }
        
        videoInfo = response.data;
        displayVideoInfo();
        displayQualityOptions();
        
    } catch (error) {
        console.error('Video bilgisi yükleme hatası:', error);
        showError('Video bilgisi yüklenemedi: ' + error.message);
    }
}

// Video bilgilerini göster
function displayVideoInfo() {
    const info = videoInfo.video_info;
    
    document.getElementById('video-title').textContent = info.title;
    document.getElementById('video-uploader').textContent = `📺 ${info.uploader}`;
    
    // Süreyi formatla
    const duration = formatDuration(info.duration);
    document.getElementById('video-duration').textContent = `⏱️ ${duration}`;
    
    hideLoading();
    document.getElementById('main-content').style.display = 'block';
}

// Kalite seçeneklerini göster
function displayQualityOptions() {
    const container = document.getElementById('quality-options');
    container.innerHTML = '';
    
    videoInfo.formats.forEach((format, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quality-option';
        optionDiv.dataset.formatIndex = index;
        
        const label = document.createElement('div');
        label.className = 'quality-label';
        label.textContent = format.quality;
        
        const type = document.createElement('div');
        type.className = 'quality-type';
        type.textContent = format.type === 'audio' ? '🎵 Ses' : '🎬 Video';
        
        optionDiv.appendChild(label);
        optionDiv.appendChild(type);
        
        // Tıklama olayı
        optionDiv.addEventListener('click', () => {
            selectQuality(format, optionDiv);
        });
        
        container.appendChild(optionDiv);
    });
}

// Kalite seçimi
function selectQuality(format, element) {
    // Önceki seçimi temizle
    document.querySelectorAll('.quality-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Yeni seçimi işaretle
    element.classList.add('selected');
    selectedFormat = format;
    
    // İndirme butonunu güncelle
    updateDownloadButton();
}

// İndirme butonunu güncelle
function updateDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    const span = downloadBtn.querySelector('span:last-child');
    
    if (selectedFormat) {
        downloadBtn.disabled = false;
        span.textContent = `${selectedFormat.quality} İndir`;
        downloadBtn.onclick = startDownload;
    } else {
        downloadBtn.disabled = true;
        span.textContent = 'Kalite Seçin';
        downloadBtn.onclick = null;
    }
}

// İndirmeyi başlat
async function startDownload() {
    try {
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.disabled = true;
        downloadBtn.querySelector('span:last-child').textContent = 'Başlatılıyor...';
        
        const response = await browser.runtime.sendMessage({
            action: 'startDownload',
            url: currentVideoUrl,
            format_id: selectedFormat.format_id,
            quality: selectedFormat.quality
        });
        
        if (!response.success) {
            throw new Error(response.error);
        }
        
        downloadId = response.data.download_id;
        showProgressSection();
        startProgressTracking();
        
    } catch (error) {
        console.error('İndirme başlatma hatası:', error);
        showError('İndirme başlatılamadı: ' + error.message);
        
        // Butonu sıfırla
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.disabled = false;
        updateDownloadButton();
    }
}

// Progress takibini başlat
function startProgressTracking() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(async () => {
        try {
            const response = await browser.runtime.sendMessage({
                action: 'getDownloadStatus',
                download_id: downloadId
            });
            
            if (response.success) {
                updateProgress(response.data);
                
                // İndirme tamamlandı veya hata oluştu
                if (response.data.status === 'tamamlandı' || response.data.status === 'hata') {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }
            }
            
        } catch (error) {
            console.error('Progress alma hatası:', error);
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }, 1000);
}

// Progress'i güncelle
function updateProgress(data) {
    const statusElement = document.getElementById('progress-status');
    const fillElement = document.getElementById('progress-fill');
    const textElement = document.getElementById('progress-text');
    
    // Durum mesajını güncelle
    let statusMessage = '';
    switch (data.status) {
        case 'başlatıldı':
            statusMessage = '🚀 İndirme başlatıldı...';
            break;
        case 'indiriliyor':
            statusMessage = `📥 İndiriliyor: ${data.filename}`;
            break;
        case 'tamamlandı':
            statusMessage = `✅ Tamamlandı: ${data.filename}`;
            break;
        case 'hata':
            statusMessage = `❌ Hata: ${data.error}`;
            break;
        default:
            statusMessage = `📊 Durum: ${data.status}`;
    }
    
    statusElement.textContent = statusMessage;
    
    // Progress bar'ı güncelle
    const progress = Math.max(0, Math.min(100, data.progress));
    fillElement.style.width = `${progress}%`;
    textElement.textContent = `${progress.toFixed(1)}%`;
    
    // Tamamlandığında başarı mesajı
    if (data.status === 'tamamlandı') {
        setTimeout(() => {
            window.close();
        }, 3000);
    }
}

// Progress bölümünü göster
function showProgressSection() {
    document.getElementById('progress-section').style.display = 'block';
    document.getElementById('download-btn').style.display = 'none';
}

// Yardımcı fonksiyonlar
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('no-video').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    hideLoading();
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('no-video').style.display = 'none';
}

function showNoVideo() {
    hideLoading();
    document.getElementById('no-video').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

function formatDuration(seconds) {
    if (!seconds) return 'Bilinmiyor';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Popup kapatıldığında temizle
window.addEventListener('beforeunload', () => {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
});
