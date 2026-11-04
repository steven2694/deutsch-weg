/* Deutsch Weg 4.0 iOS Speech Fix
 * Reuses the simple Web Speech API sequence used by the earlier working build.
 * No MP3 replacement; course content and learning data remain untouched.
 */
const CACHE_NAME = 'deutsch-weg-4-ios-speech-fix-1';
const APP_SCOPE = new URL(self.registration.scope);

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png'
  ])));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('deutsch-weg-4-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isAppDocument(url) {
  return url.origin === APP_SCOPE.origin &&
    (url.pathname === APP_SCOPE.pathname ||
     url.pathname === APP_SCOPE.pathname + 'index.html' ||
     url.pathname.endsWith('/index.html'));
}

async function patchedDocument(request) {
  const response = await fetch(request, { cache: 'no-store' });
  if (!response.ok) return response;
  const original = await response.text();
  if (original.includes('data-dw-ios-speech-fix')) return response;

  const patch = `\n<script data-dw-ios-speech-fix>
/* Keep speech playback synchronous inside the user's tap/click.
   This deliberately mirrors the minimal approach from the earlier build:
   no voice-list selection, no async wait, and no resume/cancel race. */
(function(){
  function dwSpeechNotice(message, error){
    if (typeof window.speechNotice === 'function') {
      window.speechNotice(message, !!error);
    }
  }
  window.say = function(text, rate){
    text = String(text == null ? '' : text).trim();
    if (!text) { dwSpeechNotice('没有可朗读的文字。', true); return; }
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
      dwSpeechNotice('当前浏览器不支持系统语音朗读，请使用最新版 iPhone Safari。', true);
      return;
    }
    try {
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = (typeof rate === 'number' && rate > 0) ? rate : 0.86;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = function(){ dwSpeechNotice('正在播放德语发音…'); };
      utterance.onend = function(){ dwSpeechNotice('朗读完成。'); };
      utterance.onerror = function(event){
        var reason = event && event.error ? event.error : '未知错误';
        dwSpeechNotice('朗读失败：' + reason + '。请确认 iPhone 已下载德语语音。', true);
      };
      /* Important: call speak immediately during the actual user gesture. */
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      dwSpeechNotice('正在启动德语语音…');
    } catch (error) {
      dwSpeechNotice('朗读功能发生错误：' + (error && error.message ? error.message : '请稍后重试'), true);
    }
  };
})();
</script>\n`;
  const html = original.includes('</body>')
    ? original.replace('</body>', patch + '</body>')
    : original + patch;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate' || isAppDocument(url)) {
    event.respondWith((async () => {
      try {
        const response = await patchedDocument(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      } catch (error) {
        const cached = await caches.match(request) || await caches.match(new URL('./', APP_SCOPE).href);
        return cached || new Response('Deutsch Weg 暂时无法连接网络，请联网后重新打开。', {
          status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  if (url.origin === APP_SCOPE.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
