// 서비스 워커: 이 사이트의 html / js / json 을 열 때마다 "서버에 새 버전이 있는지" 확인하게 한다.
//  - 깃허브 페이지는 파일을 최대 10분 캐시하는데, 서버 설정을 바꿀 수 없으므로 여기서 대신 처리한다.
//  - 바뀐 게 없으면 서버가 "그대로예요(304)"만 답해서 다시 내려받지 않는다.
//  - 이미지·영상은 건드리지 않는다 (용량이 커서, 브라우저 캐시를 그대로 쓴다).
//  - 이 파일은 아무것도 저장(캐시)하지 않는다. 문제가 생기면 그냥 평소처럼 네트워크로 받는다.
self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                                   // 다른 사이트(드라이브 등)는 제외
  if (/\.(mp4|webm|mov|png|jpe?g|gif|webp|svg|ico|woff2?)$/i.test(url.pathname)) return; // 이미지·영상·글꼴은 제외
  if (req.headers.has("range")) return;                                              // 영상 구간 요청은 제외

  event.respondWith(
    fetch(req, { cache: "no-cache" }).catch(function () {
      return fetch(req);
    })
  );
});
