// 모든 페이지가 공유하는 이미지·영상 삽입 함수.
// 페이지 HTML 에는 주소가 없고, 빈 자리 표시만 있다:
//     <figure class="image" data-img="폴더/이름"></figure>   -> url_data.js 의 images["폴더/이름"]
//     <figure data-video="폴더/번호"></figure>             -> url_data.js 의 videos["폴더/번호"]
// 이 파일은 두 사이트(모션 작업실·참고 작업실)가 똑같이 쓴다. 고치면 두 곳을 같이 고친다.
// 주소는 전부 url_data.js 에서 읽는다. 이미지·영상을 바꾸려면 url_data.js 만 고치면 된다.
// 영상 옵션 (url_data.js 의 각 영상에 적음):
//   loop: true  -> 소리 없이 저절로 반복 재생 (브라우저는 소리 없는 영상만 자동 재생을 허락한다)
//   drive: 주소 -> mp4 가 없으면 구글 드라이브 재생창으로, 있으면 "드라이브에서 보기" 링크를 단다
// 영상은 화면 가까이 왔을 때만 만든다. (한꺼번에 불러오면 느려지므로)
// 느린 인터넷 대책
//   - loop 영상은 화면에 절반 이상 보일 때만 받기·재생하고, 벗어나면 멈춘다. (여러 개가 한꺼번에 회선을 나눠 쓰지 않게)
//   - 영상이 버퍼링하는 동안 가운데에 "불러오는 중…"을 띄우고, 6초가 넘으면 "인터넷이 느려서 시간이 걸려요…"로 바꾼다.
//     이 표시는 window.MLAttachLoading 으로 playlist.js(전체 이어 보기)도 같이 쓴다.
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;
  var root = new URL("../", script.src); // 사이트 루트 (assets 의 한 단계 위)

  function resolve(src) {
    return /^https?:\/\//i.test(src) ? src : new URL(src, root).href;
  }

  // 드라이브 주소 -> 재생창(preview) 주소
  function drivePreview(url) {
    var m = (url || "").match(/\/file\/d\/([\w-]+)/);
    return m ? "https://drive.google.com/file/d/" + m[1] + "/preview" : null;
  }

  function note(slot, text) {
    var p = document.createElement("p");
    p.textContent = text;
    p.style.cssText = "margin:0;padding:12px;background:#f6f4f2;border-radius:8px;color:#555;font-size:14px";
    slot.appendChild(p);
    return p;
  }

  // 이미지 한 장을 자리(slot)에 채운다.
  function fillImage(slot, key, entry) {
    var src = typeof entry === "string" ? entry : entry.src;
    var width = typeof entry === "string" ? null : entry.width;
    var a = document.createElement("a");
    a.href = resolve(src);
    a.target = "_blank";
    a.rel = "noopener";
    var img = new Image();
    // loading 을 src 보다 먼저 지정해야, 화면 밖 이미지를 미리 받지 않는다.
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = key;
    img.src = resolve(src);
    img.style.cssText = "max-width:100%;height:auto" + (width ? ";width:" + width + "px" : "");
    img.addEventListener("error", function () {
      slot.textContent = "";
      note(slot, "이미지를 불러오지 못했어요: " + key);
    });
    a.appendChild(img);
    slot.appendChild(a);
  }

  // ───────── 불러오는 중 표시 (두 사이트 공통. playlist.js 도 씀) ─────────
  var loadingCssDone = false;
  function attachLoading(box, video) {
    if (!loadingCssDone) {
      loadingCssDone = true;
      var st = document.createElement("style");
      st.textContent =
        ".ml-vbox{position:relative}" +
        ".ml-loading{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:none;align-items:center;gap:8px;" +
        "padding:8px 14px;border-radius:999px;background:rgba(0,0,0,.6);color:#fff;white-space:nowrap;pointer-events:none;" +
        "font:13px/1.4 -apple-system,'Segoe UI','Malgun Gothic',sans-serif;z-index:2}" +
        ".ml-loading.on{display:flex}" +
        ".ml-loading i{width:14px;height:14px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;" +
        "animation:ml-spin .8s linear infinite}" +
        "@keyframes ml-spin{to{transform:rotate(360deg)}}";
      document.head.appendChild(st);
    }
    var el = document.createElement("div");
    el.className = "ml-loading";
    el.setAttribute("aria-live", "polite");
    el.appendChild(document.createElement("i"));
    var txt = document.createElement("span");
    el.appendChild(txt);
    box.appendChild(el);
    var want = false, slowTimer = null;
    function show() {
      if (el.classList.contains("on")) return;
      txt.textContent = "불러오는 중…";
      el.classList.add("on");
      clearTimeout(slowTimer);
      slowTimer = setTimeout(function () { txt.textContent = "인터넷이 느려서 시간이 걸려요…"; }, 6000);
    }
    function hide() { el.classList.remove("on"); clearTimeout(slowTimer); }
    video.addEventListener("play", function () { want = true; if (video.readyState < 3) show(); });
    video.addEventListener("waiting", function () { if (want) show(); });
    video.addEventListener("stalled", function () { if (want && video.readyState < 3) show(); });
    video.addEventListener("playing", hide);
    video.addEventListener("pause", function () { want = false; hide(); });
    video.addEventListener("error", hide);
    return { show: show, hide: hide };
  }
  window.MLAttachLoading = attachLoading;

  // loop 영상: 화면에 절반 이상 보일 때만 받기·재생, 벗어나면 멈춘다.
  var loopWatch = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.intersectionRatio >= 0.5) {
            if (v.preload !== "auto") v.preload = "auto";
            var pr = v.play();
            if (pr && pr.catch) pr.catch(function () {});
          } else if (!v.paused) {
            v.pause();
          }
        });
      }, { threshold: [0, 0.5] })
    : null;

  // 영상 한 개를 자리(slot)에 채운다.
  //  entry.src 가 있으면 mp4 로 직접 재생, 비어 있으면 drive 주소로 재생창을 만든다.
  function fillVideo(slot, key, entry) {
    var player;
    if (entry.src) {
      player = document.createElement("video");
      player.controls = true;
      player.preload = "metadata";
      player.setAttribute("playsinline", "");
      player.src = resolve(entry.src);
      player.style.cssText =
        "width:100%;max-width:720px;aspect-ratio:16/9;background:#000;border-radius:8px;display:block";
      // loop: true 인 영상은 소리 없이 저절로 반복 재생한다. (브라우저는 소리 없는 영상만 자동 재생을 허락한다)
      //  처음에는 정보만 받고, 화면에 절반 이상 보일 때 받기·재생을 시작한다. (loopWatch)
      if (entry.loop) {
        player.muted = true;
        player.loop = true;
        if (!loopWatch) player.autoplay = true;
      }
      player.addEventListener("error", function () {
        var msg = document.createElement("p");
        msg.textContent = "영상을 불러오지 못했어요.";
        msg.style.cssText = "margin:0;padding:12px;background:#f6f4f2;border-radius:8px;color:#555";
        var box = player.parentNode;
        if (box && box.parentNode === slot) slot.replaceChild(msg, box);
      });
    } else if (drivePreview(entry.drive)) {
      player = document.createElement("iframe");
      player.src = drivePreview(entry.drive);
      player.allow = "autoplay";
      player.setAttribute("allowfullscreen", "");
      player.loading = "lazy";
      player.style.cssText =
        "width:100%;max-width:720px;aspect-ratio:16/9;border:0;border-radius:8px;display:block";
    } else {
      note(slot, "영상 주소가 없어요: " + key);
      return;
    }
    if (player.tagName === "VIDEO") {
      // 영상은 상자(.ml-vbox)에 넣고, 가운데에 "불러오는 중…" 표시를 붙인다.
      var box = document.createElement("div");
      box.className = "ml-vbox";
      box.style.cssText = "max-width:720px";
      box.appendChild(player);
      attachLoading(box, player);
      slot.appendChild(box);
      if (entry.loop && loopWatch) loopWatch.observe(player);
    } else {
      slot.appendChild(player);
    }

    if (entry.drive) {
      var cap = document.createElement("p");
      cap.style.cssText = "font-size:13px;margin:6px 0 0";
      var link = document.createElement("a");
      link.href = entry.drive;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "재생이 안 되면 드라이브에서 보기";
      cap.appendChild(link);
      slot.appendChild(cap);
    }
  }

  function run() {
    // 주소 데이터가 아직 없으면 자리를 빈 채로 둔다. (다시 시도해서 데이터가 오면 그때 채워진다)
    if (!window.URL_DATA) return;
    var data = window.URL_DATA;
    var images = data.images || {};
    var videos = data.videos || {};

    Array.prototype.forEach.call(document.querySelectorAll("[data-img]"), function (slot) {
      if (slot.firstChild) return; // 이미 채워진 자리는 건너뜀
      var key = slot.getAttribute("data-img");
      if (images[key]) fillImage(slot, key, images[key]);
      else note(slot, "이미지 주소가 없어요: " + key);
    });
    // 영상은 화면 가까이 왔을 때만 만든다. (한꺼번에 불러오면 느려지므로)
    // 자리는 미리 16:9 로 잡아 두어서, 나중에 채워도 화면이 출렁이지 않는다.
    var lazy = "IntersectionObserver" in window
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            lazy.unobserve(en.target);
            if (en.target.firstChild) return;
            var key = en.target.getAttribute("data-video");
            fillVideo(en.target, key, videos[key]);
          });
        }, { rootMargin: "600px 0px" })
      : null;

    Array.prototype.forEach.call(document.querySelectorAll("[data-video]"), function (slot) {
      if (slot.firstChild) return; // 이미 채워진 자리는 건너뜀
      var key = slot.getAttribute("data-video");
      if (!videos[key]) return note(slot, "영상 주소가 없어요: " + key);
      slot.style.cssText = "max-width:720px;aspect-ratio:16/9";
      if (lazy) lazy.observe(slot);
      else fillVideo(slot, key, videos[key]);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  window.__mlMedia = true; // site.js 가 "이 파일이 실행됐다"를 확인하는 표시
})();
