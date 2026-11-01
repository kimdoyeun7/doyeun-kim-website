# DOYEUN KIM — V7 (관리자 연결 준비 버전)

이 폴더는 기존 V6 디자인을 유지하고, 작품·전시 정보를 Pages CMS에서 등록할 수 있도록 수정한 실제 프로젝트입니다.

## 핵심 파일
- index.html: 홈페이지 (인트로·큰 대표작·선택한 두 작품)
- works.html: 작품 모아보기 (3열)
- exhibitions.html: 전시 모아보기 (한 줄에 한 전시)
- artwork.html?id=garden: 작품 개별 상세 페이지 (모든 작품 공용)
- exhibition.html?id=spectra: 전시 개별 상세 페이지 (모든 전시 공용)
- data/works.json: 작품 정보(관리자에서 수정)
- data/exhibitions.json: 전시 정보(관리자에서 수정)
- .pages.yml: Pages CMS 설정, 삭제 금지 (Mac에서 숨김 파일임)
- cms-site.js: 위 JSON을 읽어 웹사이트를 자동 구성하는 기능
- style.css: V6의 디자인 유지 (색상·폰트 등 수정)
- script.js: 인트로 모션과 모바일 메뉴 유지

## 1. 먼저 맥북에서 실행
이 버전은 JSON 파일을 fetch()로 읽으므로 index.html을 Finder에서 더블클릭하는 file:// 방식에서는 콘텐츠가 로드되지 않습니다.
1. VS Code에서 이 폴더를 엽니다.
2. Extensions(왼쪽 네모 아이콘)에서 "Live Server" (Ritwick Dey) 확장 기능을 설치합니다.
3. index.html 파일을 오른쪽 클릭해 "Open with Live Server"를 누릅니다.
4. 브라우저에 http://127.0.0.1:5500/... 형태의 주소로 접속합니다.
5. Works, Exhibitions, 작품 상세 페이지의 이미지와 캡션을 확인합니다.

## 2. 사진이 이미 있다면
V6의 images 폴더에 직접 넣어둔 실제 JPG/PNG들을 이 V7의 images 폴더로 복사해 주세요.
없어도 플레이스홀더가 표시되고 사이트는 작동합니다.

## 3. 관리자 이용 (GitHub 계정 필요)
1. https://github.com/new 에서 새로운 Public 저장소를 생성합니다. 예: doyeun-kim-website
2. 저장소의 Add file → Upload files에서 V7 폴더 안 **내용물**을 업로드합니다.
   (V7 폴더 자체를 한 겹 더 중첩하지 마세요.)
   숨김 파일 .pages.yml 도 업로드해야 합니다. Mac Finder에서 Command + Shift + . 로 숨김 파일을 표시할 수 있습니다.
3. Settings → Pages → Deploy from a branch → main / (root) → Save를 선택합니다.
4. https://app.pagescms.org 에 접속하여 GitHub로 로그인합니다.
5. Pages CMS GitHub App을 해당 저장소에 설치/승인하고, 저장소를 선택합니다.
6. "Works / 작품 관리", "Exhibitions / 전시 관리"에서 제목, 연도, 대표사진, 갤러리 사진을 편집합니다.
7. 저장하면 GitHub 파일이 갱신되며 GitHub Pages의 공개 사이트도 새 버전으로 갱신됩니다.

관리 화면은 저장소가 GitHub에 업로드되고 Pages CMS GitHub App 접근을 승인한 다음 사용할 수 있습니다.
`index.html`을 더블클릭했을 때 JSON이 보이지 않는 것은 버그가 아니라 브라우저 보안 정책입니다.

## 작품/전시 등록 시
- ID는 영문 소문자와 숫자, 하이픈(-)만. 예: blue-garden-2024 (고유해야 함)
- ID는 이후 변경하지 않는 편이 좋습니다. 상세페이지 주소에서 사용하기 때문입니다.
- Home position: cover(첫 화면 대표작 1개), selected(아래 대표작 최대 2개), archive(Works에서만)
- Sort order: 1, 2, 3... 작은 수가 먼저 표시됩니다. 2023, 2024 작품도 업로드 가능합니다.
- 작품 이미지를 추가하면 작품 전체사진, 디테일·과정 사진을 관리화면에서 각각 추가할 수 있습니다.
- 전시는 대표 사진 1개, 전경 사진 다수, 장소·날짜·설명을 설정할 수 있습니다.

## 유의점
- 공개 GitHub 저장소에 올린 파일과 이미지, data 폴더의 내용은 모두 다른 사람이 볼 수 있습니다. 비공개 자료는 올리지 마세요.
- 이미지 경로는 data/*.json 안에서 images/파일명처럼 저장됩니다. 관리화면의 업로드를 사용하면 자동으로 작성됩니다.
- 사진이 많고 파일 크기가 매우 크면 저장소 관리가 어려워질 수 있어요. 웹용 최적화 JPEG/WebP를 권장합니다.
- 새 관리자용 사용자 계정을 별도로 만드는 방식이 아니라 GitHub 로그인으로 편집 권한을 관리합니다.
- 기존 V6에 있던 작품별 HTML 파일은 공통 artwork.html로, 전시별 HTML 파일은 공통 exhibition.html로 대체했습니다.
- 처음 공개하기 전에 기존 작업이 있다면 반드시 V6 폴더를 별도 백업해 두세요.
