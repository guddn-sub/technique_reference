// 페이지에는 이 파일 하나만 연결한다:  <script src="../assets/site.js"></script>
// 필요한 파일을 한꺼번에 내려받고(실행은 순서대로):  config.js(깃허브 아이디·저장소) -> url_data.js(주소 데이터)
//   -> layout.js(헤더·리모컨) -> media.js(이미지·영상)
//   -> playlist.js(전체 이어 보기. data-playlist 자리가 있는 페이지에서만 동작)
//
// 안전장치
//  - 이미지·영상 자리에는 처음부터 "준비 중…" 문구를 보여 준다. (빈 칸으로 남지 않게)
//  - 파일 하나라도 못 불러오면 한 번 더 시도한다.
//  - 그래도 안 되면(또는 25초가 지나도 안 끝나면) 자리에 "불러오지 못했어요. 새로고침해 주세요"를 보여 준다.
(function () {
  "use strict";
  var me = document.currentScript;
  if (!me) return;
  var base = new URL(".", me.src).href;
  var files = ["config.js", "url_data.js", "layout.js", "media.js", "playlist.js"];
  // 시간 값(시드)을 주소 뒤에 붙여서, 새로고침할 때마다 최신 파일을 받는다.
  // (깃허브 페이지는 파일을 최대 10분 캐시하므로, 이게 없으면 푸시해도 예전 파일이 보일 수 있다.)
  // 용량이 큰 이미지·영상에는 붙이지 않는다. 매번 다시 내려받게 되기 때문.
  var seed = Date.now();

  // 서비스 워커 등록: 이후에는 HTML 과 site.js 자체도 열 때마다 최신 여부를 확인한다. (sw.js 참고)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(new URL("../sw.js", me.src).href).catch(function () {});
  }

  // ───────── 자리 표시 문구 (자리가 비어 있는 동안에만 보이고, 채워지면 저절로 사라진다) ─────────
  var css =
    "[data-img]:empty::before,[data-video]:empty::before{display:block;box-sizing:border-box;max-width:720px;" +
    "padding:14px;margin:8px 0;background:#f6f4f2;border-radius:8px;color:#777;font-size:14px}" +
    '[data-img]:empty::before{content:"이미지 준비 중…"}' +
    '[data-video]:empty::before{content:"영상 준비 중…"}' +
    'html.ml-fail [data-img]:empty::before{content:"이미지를 불러오지 못했어요. 새로고침해 주세요."}' +
    'html.ml-fail [data-video]:empty::before{content:"영상을 불러오지 못했어요. 새로고침해 주세요."}';
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // 각 파일이 제대로 실행됐는지 확인하는 표시 (각 파일이 스스로 남긴다)
  var done = {
    "config.js": function () { return !!window.SITE_CONFIG; },
    "url_data.js": function () { return !!window.URL_DATA; },
    "layout.js": function () { return !!window.__mlLayout; },
    "media.js": function () { return !!window.__mlMedia; },
    "playlist.js": function () { return !!window.__mlPlaylist; }
  };
  function allOk() {
    return files.every(function (f) { return done[f](); });
  }

  function load(name, tag) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = base + name + "?v=" + seed + (tag || "");
      s.async = false; // 내려받기는 동시에, 실행은 넣은 순서대로
      s.onload = s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  function fail() {
    document.documentElement.classList.add("ml-fail");
  }

  Promise.all(files.map(function (f) { return load(f); }))
    .then(function () {
      if (allOk()) return;
      // 못 불러온 파일만 한 번 더 시도한다. 주소 데이터를 다시 받으면 media.js 도 다시 실행해야 한다.
      var redo = files.filter(function (f) { return !done[f](); });
      if (redo.indexOf("url_data.js") >= 0 && redo.indexOf("media.js") < 0) redo.push("media.js");
      if (redo.indexOf("url_data.js") >= 0 && redo.indexOf("playlist.js") < 0) redo.push("playlist.js");
      redo = files.filter(function (f) { return redo.indexOf(f) >= 0; });
      return Promise.all(redo.map(function (f) { return load(f, "&r=1"); }));
    })
    .then(function () {
      if (!allOk()) fail();
    });

  // 네트워크가 멈춰서 아무 답이 없는 경우를 위한 안전장치
  setTimeout(function () {
    if (!allOk()) fail();
  }, 25000);
})();
