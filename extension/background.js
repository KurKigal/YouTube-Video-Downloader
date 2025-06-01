// background.js - Python backend ile iletişim

const BACKEND_URL = 'http://127.0.0.1:5000';

// Sayfa yüklendiğinde kontrol et
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (isVideoSite(tab.url)) {
      checkBackendConnection().then(isConnected => {
        if (isConnected) {
          browser.pageAction.show(tabId);
        }
      });
    } else {
      browser.pageAction.hide(tabId);
    }
  }
});

// Video sitesi kontrolü
function isVideoSite(url) {
  return (
    url.includes('youtube.com/watch') ||
    url.includes('instagram.com/p/') ||
    url.includes('instagram.com/reel/') ||
    url.includes('instagram.com/tv/')
  );
}

// Backend bağlantısını kontrol et
async function checkBackendConnection() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.log('Backend bağlantısı yok:', error);
    return false;
  }
}

// Video bilgilerini backend'den al
async function getVideoInfo(url) {
  try {
    const response = await fetch(`${BACKEND_URL}/video-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Video bilgisi alma hatası:', error);
    throw error;
  }
}

// İndirmeyi başlat
async function startDownload(url, formatId, quality) {
  try {
    const response = await fetch(`${BACKEND_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        format_id: formatId,
        quality: quality
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('İndirme başlatma hatası:', error);
    throw error;
  }
}

// İndirme durumunu kontrol et
async function getDownloadStatus(downloadId) {
  try {
    const response = await fetch(`${BACKEND_URL}/download-status/${downloadId}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('İndirme durumu alma hatası:', error);
    throw error;
  }
}

// Content script'ten gelen mesajları dinle
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background mesaj aldı:', message);
  
  if (message.action === 'videoDetected') {
    browser.pageAction.show(sender.tab.id);
    
  } else if (message.action === 'getVideoInfo') {
    getVideoInfo(message.url)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
    
  } else if (message.action === 'startDownload') {
    startDownload(message.url, message.format_id, message.quality)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
    
  } else if (message.action === 'getDownloadStatus') {
    getDownloadStatus(message.download_id)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
    
  } else if (message.action === 'checkBackend') {
    checkBackendConnection()
      .then(isConnected => sendResponse({ success: true, connected: isConnected }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
  }
});

// Extension yüklendiğinde
browser.runtime.onInstalled.addListener(() => {
  console.log('Video İndirici Pro yüklendi');
  
  // Backend bağlantısını kontrol et
  checkBackendConnection().then(isConnected => {
    if (!isConnected) {
      console.warn('⚠️ Backend servisi çalışmıyor. Python server\'ını başlatın!');
    } else {
      console.log('✅ Backend servisi çalışıyor');
    }
  });
});

