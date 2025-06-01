// content.js - Video algılama ve backend iletişimi

let currentVideoUrl = null;

// Sayfa yüklendiğinde kontrol et
window.addEventListener('load', () => {
  setTimeout(checkForVideo, 2000);
});

// URL değişikliklerini dinle
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(checkForVideo, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Video kontrolü
function checkForVideo() {
  const url = window.location.href;
  
  if (isVideoUrl(url)) {
    currentVideoUrl = url;
    console.log('Video algılandı:', url);
    
    // Background script'e video bulunduğunu bildir
    browser.runtime.sendMessage({
      action: 'videoDetected',
      url: url
    });
  }
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

// Popup'tan gelen mesajları dinle
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrentVideoUrl') {
    sendResponse({ url: currentVideoUrl || window.location.href });
  }
});

console.log('Video İndirici Pro content script yüklendi');
