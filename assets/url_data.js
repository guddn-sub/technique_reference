// 영상 주소 데이터 — 주소가 바뀌거나 파일을 바꾸면 이 파일만 고치면 됩니다.
// 페이지(HTML)에는 주소가 없고, 빈 자리 표시만 있습니다:
//     <figure data-video="3d/15"></figure>   <- videos["3d/15"]
//
//  [videos]  키: "카테고리/클립번호"   (클립 번호는 전체 이어 보기 순서와 같아요)
//            src  : 사이트 기준 mp4 경로 (videos/클립번호.mp4, 하위 폴더 없음)
//            loop : true 면 화면에 보일 때 소리 없이 저절로 반복 재생
//            title/who/site : 전체 이어 보기 목록에 쓰는 제목·학생·학생 사이트 주소
window.URL_DATA = {

  images: {},

  videos: {
    // ── 2. 화면 연출 (CSS·2D) ──
    "css/01": { src: "videos/01.mp4", loop: true, no: 1, title: "클릭하면 벗겨지는 손그림 스티커", who: "고지현", site: "https://project-pink-six-77.vercel.app/" },
    "css/05": { src: "videos/05.mp4", loop: true, no: 5, title: "별자리 히어로와 별똥별", who: "조성욱", site: "https://jeju-gods.vercel.app/" },
    "css/06": { src: "videos/06.mp4", loop: true, no: 6, title: "픽셀아트 첫 화면", who: "현정열", site: "https://jejuprojectorca.vercel.app/" },
    "css/07": { src: "videos/07.mp4", loop: true, no: 7, title: "일러스트 배경 연출", who: "진성은", site: "https://jeju-ip-project-2pya.vercel.app/" },
    "css/08": { src: "videos/08.mp4", loop: true, no: 8, title: "일러스트 장면 바뀜", who: "진성은", site: "https://jeju-ip-project-2pya.vercel.app/" },
    "css/13": { src: "videos/13.mp4", loop: true, no: 13, title: "바다 배경 슬라이드", who: "오수민", site: "https://jejubadatagi.vercel.app/" },
    "css/14": { src: "videos/14.mp4", loop: true, no: 14, title: "배경 사진 크로스페이드", who: "양혁준", site: "https://jn-uproject.vercel.app/" },
    "css/20": { src: "videos/20.mp4", loop: true, no: 20, title: "픽셀아트 밤 풍경 카드", who: "현지훈", site: "https://jeju-story.vercel.app/quest" },
    "css/30": { src: "videos/30.mp4", loop: true, no: 30, title: "마우스에 반응하는 별자리 히어로", who: "조성욱", site: "https://jeju-gods.vercel.app/" },
    "css/31": { src: "videos/31.mp4", loop: true, no: 31, title: "마우스 올리면 사진이 되는 선화 카드", who: "고지현", site: "https://project-pink-six-77.vercel.app/stories" },
    "css/35": { src: "videos/35.mp4", loop: true, no: 35, title: "영상 미리보기로 이어지는 신들 소개", who: "조성욱", site: "https://jeju-gods.vercel.app/film" },
    "css/36": { src: "videos/36.mp4", loop: true, no: 36, title: "스크롤하면 밤이 되는 픽셀 배경", who: "현정열", site: "https://jejuprojectorca.vercel.app/explore" },
    // ── 3. 3D 장면 (three.js) ──
    "3d/03": { src: "videos/03.mp4", loop: true, no: 3, title: "3D 주차장과 하르방 자동차", who: "셩연호", site: "https://prj-umhv.vercel.app/" },
    "3d/04": { src: "videos/04.mp4", loop: true, no: 4, title: "로우폴리 섬과 흐르는 구름", who: "이정은", site: "https://jeju-wellness-concierge-seven.vercel.app/" },
    "3d/09": { src: "videos/09.mp4", loop: true, no: 9, title: "히어로 속 3D 미니 섬", who: "박주연", site: "https://jeju-local-trip.vercel.app/" },
    "3d/10": { src: "videos/10.mp4", loop: true, no: 10, title: "히어로 카드 속 3D 섬", who: "김재민", site: "https://jeju-prj-tawny.vercel.app/" },
    "3d/11": { src: "videos/11.mp4", loop: true, no: 11, title: "인사하는 3D 캐릭터", who: "김현주(3978)", site: "https://projectjeju.vercel.app/" },
    "3d/12": { src: "videos/12.mp4", loop: true, no: 12, title: "밤의 3D 섬과 빛나는 이름표", who: "양수연", site: "https://projectday6.vercel.app/" },
    "3d/15": { src: "videos/15.mp4", loop: true, no: 15, title: "돌담을 넘는 바람 입자 3D", who: "박지환", site: "https://doldam-today-jeju-project.vercel.app/wind" },
    "3d/16": { src: "videos/16.mp4", loop: true, no: 16, title: "돌아가는 3D 돌하르방", who: "김재민", site: "https://jeju-prj-tawny.vercel.app/stone" },
    "3d/17": { src: "videos/17.mp4", loop: true, no: 17, title: "수채화 3D 섬 돌려 보기", who: "고지현", site: "https://project-pink-six-77.vercel.app/island" },
    "3d/18": { src: "videos/18.mp4", loop: true, no: 18, title: "장난감 보드 위 3D 섬", who: "김소윤", site: "https://project-jnuedu001-1062.vercel.app/map3d" },
    "3d/21": { src: "videos/21.mp4", loop: true, no: 21, title: "회전하는 3D 블록 썸네일", who: "조성욱", site: "https://jeju-gods.vercel.app/game" },
    "3d/22": { src: "videos/22.mp4", loop: true, no: 22, title: "셰이더 바다 3D 지도", who: "조성욱", site: "https://jeju-gods.vercel.app/myths" },
    "3d/23": { src: "videos/23.mp4", loop: true, no: 23, title: "하루가 흐르는 하늘과 날씨", who: "이승우", site: "https://jeju-golden-hour.vercel.app/" },
    "3d/24": { src: "videos/24.mp4", loop: true, no: 24, title: "별자리 천구", who: "조성욱", site: "https://jeju-gods.vercel.app/myths" },
    "3d/25": { src: "videos/25.mp4", loop: true, no: 25, title: "바다와 돌고래", who: "김민기", site: "https://prj-kappa-nine.vercel.app/map" },
    "3d/28": { src: "videos/28.mp4", loop: true, no: 28, title: "새벽·아침·밤 바뀌는 3D 섬", who: "김민기", site: "https://prj-kappa-nine.vercel.app/map" },
    "3d/29": { src: "videos/29.mp4", loop: true, no: 29, title: "3D 별자리 끌어 돌리고 확대", who: "조성욱", site: "https://jeju-gods.vercel.app/myths" },
    "3d/32": { src: "videos/32.mp4", loop: true, no: 32, title: "신 고르면 카메라가 날아가는 3D 섬", who: "김민기", site: "https://prj-kappa-nine.vercel.app/myths" },
    "3d/33": { src: "videos/33.mp4", loop: true, no: 33, title: "3D 바람 지도 보드", who: "김현주(1530)", site: "https://campingmate.vercel.app/map" },
    "3d/34": { src: "videos/34.mp4", loop: true, no: 34, title: "3D 노을 배경 발표 슬라이드", who: "이승우", site: "https://jeju-golden-hour.vercel.app/slides" },
    // ── 4. 지도와 위치 ──
    "map/02": { src: "videos/02.mp4", loop: true, no: 2, title: "스크롤 따라가는 위성 지도 스토리", who: "송지헌", site: "https://project-red-gamma-91.vercel.app/" },
    "map/19": { src: "videos/19.mp4", loop: true, no: 19, title: "어둠 속 빛나는 3D 지도", who: "양혁준", site: "https://jn-uproject.vercel.app/map" },
    "map/26": { src: "videos/26.mp4", loop: true, no: 26, title: "손그림 지도", who: "정은교", site: "https://jejuip.vercel.app/3d" },
    "map/37": { src: "videos/37.mp4", loop: true, no: 37, title: "손그림 올레 지도", who: "정은교", site: "https://jejuip.vercel.app/map" },
    // ── 8. 만들고 내보내기 ──
    "export/27": { src: "videos/27.mp4", loop: true, no: 27, title: "사진 앨범 슬라이드", who: "양혁준", site: "https://jn-uproject.vercel.app/album" },
  },
};
