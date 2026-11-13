// 모든 페이지가 공유하는 공통 레이아웃:
//   - 맨 위 띠: 지금 어디에서 실행 중인지 (깃허브 / 내 PC 파일로 열기 / 내 PC 로컬 서버 / 그 밖)
//   - 헤더: 윗줄 [🏠 홈] 버튼 + 오른쪽 끝 버전(예: V0.2.2) / 아랫줄 경로(홈 › 사이트 제목 › 현재 페이지)
//       · 🏠 홈 = 허브. 깃허브에서는 https://{id}.github.io/, 파일로 열면 옆 허브 폴더 (config.js 의 id·hubFolder)
//       · 경로의 사이트 제목 = 이 사이트의 목차(index.html)
//   - 오른쪽 아래 리모컨: ▲ 맨 위 / ▼ 맨 아래
// 사이트 제목·버전은 아래 "설정"에서 바꾼다. (버전은 작업할 때마다 올리고 CHANGELOG.md 에 적는다)
(function () {
  "use strict";

  // ───────── 설정 ─────────
  var SITE_TITLE = "참고 작업실";   // 사이트 제목 (경로, 목차 제목에 쓰임)
  // "홈" 링크 = 허브 https://{아이디}.github.io/  (config.js 가 없으면 이 사이트의 index.html)
  //  내 PC 에서 html 을 그냥 열었으면(file://) 나란히 있는 허브 폴더 ../{hubFolder}/index.html 로 간다.
  var CFG = window.SITE_CONFIG;
  var LOCAL = location.protocol === "file:";
  var HOME_URL = !CFG ? null
    : LOCAL && CFG.hubFolder ? "../" + CFG.hubFolder + "/index.html"
    : CFG.id ? "https://" + CFG.id + ".github.io/" : null;
  var HOME_LABEL = "홈";
  // 버전 (큰 변화 . 중요한 변화 . 사소한 변화). 작업할 때마다 올리고 CHANGELOG.md 에도 적는다.
  var SITE_VERSION = "0.4.7";
  // ─────────────────────────

  var script = document.currentScript;
  if (!script) return;
  if (window.__mlLayout) return;   // 다시 시도할 때 헤더가 두 번 생기지 않게
  window.__mlLayout = true;
  var root = new URL("../", script.src);                 // assets/ 의 한 단계 위 = 사이트 루트
  var indexUrl = new URL("index.html", root).href;
  var homeUrl = HOME_URL ? new URL(HOME_URL, root).href : indexUrl;
  var path = location.pathname;
  var isIndex = path === root.pathname || path === root.pathname + "index.html";

  // 목차 페이지의 제목도 변수를 따른다.
  if (isIndex) {
    document.title = SITE_TITLE;
    var h1 = document.querySelector("h1.page-title");
    if (h1) h1.textContent = SITE_TITLE;
  }

  var pageTitleEl = document.querySelector("h1.page-title");
  var pageTitle = pageTitleEl ? pageTitleEl.textContent.trim() : document.title;

  // ───────── 스타일 (이 파일 하나에 포함) ─────────
  var css =
    ".ml-bar{position:sticky;top:0;z-index:50;display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:8px 14px;" +
    "background:rgba(255,255,255,.96);border-bottom:1px solid #e5e1dc;" +
    "font:14px/1.4 -apple-system,'Segoe UI','Malgun Gothic',sans-serif}" +
    ".ml-actions{display:flex;align-items:center;gap:8px;width:100%}" +
    ".ml-ver{margin-left:auto;color:#8a867d;font-size:12px;letter-spacing:.02em}" +
    ".ml-btn{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border:1px solid #d9d5ce;border-radius:8px;" +
    "background:#fff;color:#222;font:inherit;text-decoration:none;cursor:pointer;white-space:nowrap}" +
    ".ml-btn:hover{border-color:#e8742a;color:#c45a14}" +
    ".ml-crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;min-width:0;color:#555}" +
    ".ml-crumbs a{color:#555;text-decoration:none}" +
    ".ml-crumbs a:hover{color:#c45a14;text-decoration:underline}" +
    ".ml-crumbs .cur{color:#111;font-weight:600}" +
    ".ml-sep{color:#b5b0a6}" +
    // 노션 코드 상자: 안쪽 code 의 글꼴을 pre(노션이 정한 글꼴·크기)를 따르게 한다.
    // (외부 prism 스타일을 뺀 뒤, 브라우저 기본 고정폭 글꼴로 바뀌어 글자가 작아지는 것을 막는다)
    "pre.code>code{font-family:inherit}" +
    ".ml-remote{position:fixed;right:16px;bottom:20px;z-index:50;display:flex;flex-direction:column;gap:8px}" +
    ".ml-remote button{width:42px;height:42px;border-radius:50%;border:1px solid #d9d5ce;background:#fff;color:#222;" +
    "box-shadow:0 2px 8px rgba(0,0,0,.15);font-size:16px;line-height:1;cursor:pointer}" +
    ".ml-remote button:hover{border-color:#e8742a;color:#c45a14}" +
    // 맨 위 실행 위치 띠 (깃허브: 초록 / 내 PC: 주황 / 그 밖: 회색)
    ".ml-env{align-self:stretch;margin:-8px -14px 0;padding:4px 14px;text-align:center;font-size:12px;" +
    "background:#f6f4f2;color:#555;border-bottom:1px solid #e5e1dc}" +
    ".ml-env.github{background:#eef6ee;color:#2f6b35;border-color:#cfe5d1}" +
    ".ml-env.file,.ml-env.localhost{background:#fdf1e7;color:#c45a14;border-color:#f3d3b8}" +
    // 좁은 화면(휴대폰)에서는 본문 좌우에 16px 여백 (노션 내보내기 CSS 는 여백이 없어 글이 화면 끝에 붙는다)
    "@media (max-width:940px){body{padding-left:16px !important;padding-right:16px !important}}" +
    "@media (max-width:560px){.ml-bar{padding:6px 10px;gap:6px}.ml-btn{padding:5px 9px}.ml-env{margin:-6px -10px 0;padding:4px 10px}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function crumbLink(label, href) {
    var a = el("a", null, label);
    a.href = href;
    return a;
  }

  // ───────── 헤더 ─────────
  var bar = el("div", "ml-bar");

  // 맨 위 띠: 지금 어디에서 실행 중인지 항상 보여 준다.
  var host = location.hostname;
  var env = LOCAL ? "file"
    : /\.github\.io$/i.test(host) ? "github"
    : host === "localhost" || host === "127.0.0.1" || host === "[::1]" ? "localhost"
    : "other";
  var envText = {
    github: "깃허브에서 실행 중 · " + location.host,
    file: "내 PC 폴더에서 실행 중 (파일로 열기) · 홈은 옆 허브 폴더로 연결돼요",
    localhost: "내 PC 로컬 서버에서 실행 중 · " + location.host + " · 홈은 깃허브로 연결돼요",
    other: location.host + " 에서 실행 중 · 홈은 깃허브로 연결돼요"
  }[env];
  bar.appendChild(el("div", "ml-env " + env, envText));

  var home = el("a", "ml-btn", "🏠 " + HOME_LABEL);
  home.href = homeUrl;

  var crumbs = el("nav", "ml-crumbs");
  crumbs.setAttribute("aria-label", "경로");
  crumbs.appendChild(crumbLink(HOME_LABEL, homeUrl));
  crumbs.appendChild(el("span", "ml-sep", "›"));
  if (isIndex) {
    crumbs.appendChild(el("span", "cur", SITE_TITLE));
  } else {
    crumbs.appendChild(crumbLink(SITE_TITLE, indexUrl));
    crumbs.appendChild(el("span", "ml-sep", "›"));
    crumbs.appendChild(el("span", "cur", pageTitle));
  }

  // 윗줄: 홈 버튼 / 아랫줄: 경로
  var actions = el("div", "ml-actions");
  actions.appendChild(home);
  var ver = el("span", "ml-ver", "V" + SITE_VERSION);   // 같은 줄 오른쪽 끝에 버전 표시
  ver.title = "버전 " + SITE_VERSION;
  actions.appendChild(ver);
  bar.appendChild(actions);
  bar.appendChild(crumbs);
  document.body.insertBefore(bar, document.body.firstChild);

  // ───────── 리모컨 (맨 위 / 맨 아래) ─────────
  var remote = el("div", "ml-remote");
  var up = el("button", null, "▲");
  up.type = "button";
  up.title = "맨 위로";
  up.setAttribute("aria-label", "맨 위로");
  up.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  var down = el("button", null, "▼");
  down.type = "button";
  down.title = "맨 아래로";
  down.setAttribute("aria-label", "맨 아래로");
  down.addEventListener("click", function () {
    // 노션 페이지는 DOCTYPE 이 없어 호환 모드로 열리므로 body 와 html 중 큰 높이를 쓴다.
    var full = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    window.scrollTo({ top: full, behavior: "smooth" });
  });
  remote.appendChild(up);
  remote.appendChild(down);
  document.body.appendChild(remote);
})();
