// 전체 이어 보기: 페이지의 <div data-playlist></div> 자리에 연속 재생기를 만든다.
// 영상 목록은 url_data.js 의 videos 에서 no(클립 번호) 순서로 읽는다. 이 파일에는 주소가 없다.
// data-playlist 자리가 없는 페이지에서는 아무것도 하지 않는다.
// 이 파일은 두 사이트(모션 작업실·참고 작업실)가 똑같이 쓴다. 고치면 두 곳을 같이 고친다.
//
// 기능
//  - 자동 넘김 켜기/끄기: 끄면 지금 클립만 계속 반복한다. (설정은 이 브라우저에 기억)
//  - 전체화면: 영상과 제목 줄을 화면 가득. Esc 로 나간다.
//  - 진행 막대를 누르면 그 위치로 이동.
//  - 이 페이지는 페이지 전체(헤더·제목·재생기)를 화면의 80%(최대 1400px)로 넓혀서 크게 본다.
//  - 키보드: ← → 이전/다음 · 스페이스 일시정지 · F 전체화면 · A 자동 넘김
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;
  window.__mlPlaylist = true; // site.js 가 "이 파일이 실행됐다"를 확인하는 표시
  var root = new URL("../", script.src);
  var STORE = "ml-playlist-auto";

  function getAuto() {
    try { return localStorage.getItem(STORE) !== "off"; } catch (e) { return true; }
  }
  function setAuto(on) {
    try { localStorage.setItem(STORE, on ? "on" : "off"); } catch (e) { /* 저장 안 돼도 동작은 함 */ }
  }

  function run() {
    var slot = document.querySelector("[data-playlist]");
    if (!slot || slot.firstChild || !window.URL_DATA) return;
    var videos = window.URL_DATA.videos || {};
    var items = Object.keys(videos)
      .map(function (k) { var v = videos[k]; return { key: k, no: v.no || 0, title: v.title || k, who: v.who || "", site: v.site || "", src: v.src }; })
      .filter(function (it) { return it.src; })
      .sort(function (a, b) { return a.no - b.no; });
    if (!items.length) return;

    var css =
      // 이 페이지만 페이지 전체(헤더·제목·재생기)를 넓게: 화면의 80%, 최대 1400px. 모두 같은 폭으로 맞춘다.
      "@media (min-width:1000px){body{max-width:min(1400px,80vw) !important}}" +
      ".pl-wrap{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:14px;width:100%}" +
      ".pl-stage{min-width:0}" +
      ".pl-screen{position:relative;background:#000;border-radius:10px;overflow:hidden}" +
      // 화면 높이를 넘지 않게: 영상 아래 제목·버튼 줄까지 한 화면에 보이도록
      ".pl-screen video{width:100%;aspect-ratio:16/9;max-height:calc(100vh - 190px);display:block;background:#000;object-fit:contain}" +
      ".pl-stage{scroll-margin-top:110px}" +
      ".pl-bar{height:8px;background:#e5e1dc;border-radius:4px;margin:10px 0 8px;overflow:hidden;cursor:pointer}" +
      ".pl-bar i{display:block;height:100%;width:0;background:#e8742a;pointer-events:none}" +
      ".pl-now{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;font-size:16px}" +
      ".pl-now b{color:#c45a14}.pl-now .who{color:#8a867d;font-size:14px}.pl-now a{font-size:14px;color:#8a867d}" +
      ".pl-ctl{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;align-items:center}" +
      ".pl-ctl button{padding:7px 14px;border:1px solid #d9d5ce;border-radius:8px;background:#fff;font:inherit;cursor:pointer}" +
      ".pl-ctl button:hover{border-color:#e8742a;color:#c45a14}" +
      ".pl-ctl .pl-auto[aria-pressed=true]{background:#fdf1e7;border-color:#e8742a;color:#c45a14}" +
      ".pl-ctl .sp{flex:1}" +
      ".pl-ctl .hint{color:#8a867d;font-size:12px}" +
      ".pl-list{max-height:calc(100vh - 150px);overflow-y:auto;border:1px solid #e5e1dc;border-radius:10px;padding:4px}" +
      ".pl-item{display:flex;gap:8px;padding:7px 9px;border-radius:6px;cursor:pointer;font-size:14px;line-height:1.35}" +
      ".pl-item:hover{background:#f6f4f2}.pl-item.on{background:#fdf1e7;outline:1px solid #e8742a}" +
      ".pl-item .n{color:#c45a14;min-width:22px;font-variant-numeric:tabular-nums}.pl-item .w{display:block;color:#8a867d;font-size:12px}" +
      // 전체화면: 영상 + 아래 한 줄(번호·제목·버튼)
      ".pl-stage:fullscreen{background:#000;display:flex;flex-direction:column;padding:0}" +
      ".pl-stage:fullscreen .pl-screen{flex:1;border-radius:0;display:flex;align-items:center}" +
      ".pl-stage:fullscreen .pl-screen video{height:100%;aspect-ratio:auto}" +
      ".pl-stage:fullscreen .pl-bar{margin:0;border-radius:0;background:#333}" +
      ".pl-stage:fullscreen .pl-now,.pl-stage:fullscreen .pl-ctl{padding:6px 16px;margin:0;color:#eee}" +
      ".pl-stage:fullscreen .pl-ctl button{background:#222;color:#eee;border-color:#444}" +
      ".pl-stage:fullscreen .pl-ctl .pl-auto[aria-pressed=true]{background:#5a3214;border-color:#e8742a;color:#ffd2ad}" +
      "@media (max-width:860px){.pl-wrap{grid-template-columns:1fr}.pl-list{max-height:320px}.pl-ctl .hint{display:none}}";
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    slot.innerHTML =
      '<div class="pl-wrap"><div class="pl-stage">' +
      '<div class="pl-screen"><video muted autoplay playsinline></video></div>' +
      '<div class="pl-bar" title="누르면 그 위치로 이동"><i></i></div><div class="pl-now"></div>' +
      '<div class="pl-ctl">' +
      '<button type="button" data-a="prev">◀ 이전</button>' +
      '<button type="button" data-a="play">일시정지</button>' +
      '<button type="button" data-a="next">다음 ▶</button>' +
      '<button type="button" data-a="auto" class="pl-auto"></button>' +
      '<button type="button" data-a="full">⛶ 전체화면</button>' +
      '<span class="sp"></span><span class="hint">← → 이동 · 스페이스 일시정지 · F 전체화면 · A 자동 넘김</span>' +
      '</div></div><div class="pl-list"></div></div>';
    var stage = slot.querySelector(".pl-stage");
    var v = slot.querySelector("video");
    var barBox = slot.querySelector(".pl-bar");
    var bar = barBox.querySelector("i");
    var now = slot.querySelector(".pl-now");
    var list = slot.querySelector(".pl-list");
    var playBtn = slot.querySelector('[data-a="play"]');
    var autoBtn = slot.querySelector('[data-a="auto"]');
    var fullBtn = slot.querySelector('[data-a="full"]');
    var cur = 0;
    var auto = getAuto();

    function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
    items.forEach(function (it, i) {
      var d = document.createElement("div");
      d.className = "pl-item";
      d.innerHTML = '<span class="n">' + it.no + "</span><span>" + esc(it.title) + '<span class="w">' + esc(it.who) + "</span></span>";
      d.addEventListener("click", function () { go(i); });
      list.appendChild(d);
    });

    function showAuto() {
      autoBtn.setAttribute("aria-pressed", auto ? "true" : "false");
      autoBtn.textContent = auto ? "자동 넘김: 켜짐" : "자동 넘김: 꺼짐 (반복)";
      v.loop = !auto; // 꺼져 있으면 지금 클립만 반복
    }

    // 목록 안에서만 스크롤한다. (페이지 전체가 움직이지 않게)
    function keepInList(el) {
      var top = el.offsetTop - list.offsetTop, bottom = top + el.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top - 4;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 4;
    }

    function go(i) {
      cur = (i + items.length) % items.length; // 마지막 다음은 다시 처음
      var it = items[cur];
      v.src = new URL(it.src, root).href;
      v.play().catch(function () {});
      now.innerHTML = "<b>" + it.no + " / " + items.length + "</b>" + esc(it.title) +
        '<span class="who">' + esc(it.who) + "</span>" +
        (it.site ? '<a href="' + it.site + '" target="_blank" rel="noopener">사이트 열기</a>' : "");
      Array.prototype.forEach.call(list.children, function (c, k) { c.classList.toggle("on", k === cur); });
      keepInList(list.children[cur]);
      playBtn.textContent = "일시정지";
    }

    function togglePlay() {
      if (v.paused) { v.play(); playBtn.textContent = "일시정지"; }
      else { v.pause(); playBtn.textContent = "재생"; }
    }
    function toggleAuto() { auto = !auto; setAuto(auto); showAuto(); }
    function toggleFull() {
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
      else if (stage.requestFullscreen) stage.requestFullscreen().catch(function () {});
    }

    v.addEventListener("ended", function () { if (auto) go(cur + 1); });
    v.addEventListener("error", function () { setTimeout(function () { go(cur + 1); }, 800); }); // 못 불러오면 건너뜀
    v.addEventListener("timeupdate", function () { bar.style.width = v.duration ? (v.currentTime / v.duration) * 100 + "%" : "0"; });
    v.addEventListener("click", togglePlay);
    v.addEventListener("dblclick", toggleFull);
    barBox.addEventListener("click", function (e) {
      if (!v.duration) return;
      var r = barBox.getBoundingClientRect();
      v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * v.duration;
    });
    slot.querySelector('[data-a="prev"]').addEventListener("click", function () { go(cur - 1); });
    slot.querySelector('[data-a="next"]').addEventListener("click", function () { go(cur + 1); });
    playBtn.addEventListener("click", togglePlay);
    autoBtn.addEventListener("click", toggleAuto);
    fullBtn.addEventListener("click", toggleFull);
    document.addEventListener("fullscreenchange", function () {
      fullBtn.textContent = document.fullscreenElement ? "⛶ 전체화면 나가기" : "⛶ 전체화면";
    });
    document.addEventListener("keydown", function (e) {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      var k = e.key.toLowerCase();
      if (k === "arrowright") go(cur + 1);
      else if (k === "arrowleft") go(cur - 1);
      else if (k === " ") { e.preventDefault(); togglePlay(); }
      else if (k === "f") toggleFull();
      else if (k === "a") toggleAuto();
    });
    showAuto();
    go(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
