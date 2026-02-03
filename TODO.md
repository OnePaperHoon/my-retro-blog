# 📋 TODO List - Windows 98 OS 시뮬레이션

## ✅ 완료된 작업 (Phase 1-2)

### Phase 1: 기본 시스템
- [x] 부팅 화면 (BIOS + Windows 98 로고)
- [x] 바탕화면 배경 (#008080)
- [x] 바탕화면 아이콘 (6개)
- [x] 아이콘 선택 기능
- [x] 아이콘 드래그 이동
- [x] 아이콘 더블클릭 실행
- [x] 시작 메뉴 구조
- [x] 시작 메뉴 하위 메뉴 (Programs)
- [x] Shut Down 다이얼로그
- [x] 작업 표시줄 레이아웃
- [x] 시작 버튼
- [x] 열린 창 버튼 목록
- [x] 시스템 트레이 (시계)
- [x] 창 시스템 (Window)
- [x] 창 드래그 이동
- [x] 창 크기 조절 (8방향)
- [x] 최소화/최대화/닫기 버튼
- [x] Z-Index 포커스 관리
- [x] 우클릭 컨텍스트 메뉴 시스템
- [x] 바탕화면 우클릭 메뉴
- [x] 아이콘 우클릭 메뉴
- [x] 작업표시줄 우클릭 메뉴

### Phase 2: 핵심 애플리케이션
- [x] 파일 탐색기 (Explorer)
  - [x] 2패널 레이아웃
  - [x] 폴더 트리
  - [x] 파일 목록
  - [x] 3가지 보기 방식
  - [x] 네비게이션 (뒤로/앞으로/상위)
  - [x] 툴바
  - [x] 주소 표시줄
  - [x] 상태 표시줄
- [x] 다이얼로그 시스템
  - [x] Dialog 기본 컴포넌트
  - [x] MessageBox (Info/Warning/Error/Question)
  - [x] ConfirmDialog (Yes/No, OK/Cancel)
  - [x] InputDialog
  - [x] ShutDownDialog
  - [x] DialogManager
  - [x] useDialog 훅
- [x] 메모장 (Notepad)
  - [x] 메뉴 시스템 (File/Edit/Format/View/Help)
  - [x] 텍스트 편집
  - [x] Word Wrap
  - [x] 상태 표시줄 (줄/열)
  - [x] 찾기 기능
  - [x] 키보드 단축키
- [x] 가상 파일 시스템 (포트폴리오 데이터)

---

## 🚧 진행 중인 작업

없음 (Phase 3 완료)

---

## ✅ Phase 3: 추가 애플리케이션 (완료)

### 우선순위: 높음 ⭐⭐⭐
- [x] **사운드 효과 시스템**
  - [x] sounds.js 유틸리티 생성
  - [x] Windows 98 시작 음악
  - [x] 버튼 클릭 소리
  - [x] 에러/경고/알림 소리
  - [x] 음량 조절 기능
  - [x] 설정에서 음소거 토글

- [x] **아이콘 정렬 기능 활성화**
  - [x] by Name (이름순)
  - [x] by Type (종류순)
  - [x] by Size (크기순)
  - [x] Auto Arrange (자동 정렬)
  - [x] Line up Icons (눈금에 맞춤)

### 우선순위: 중간 ⭐⭐
- [x] **계산기 (Calculator)**
  - [x] UI 레이아웃 (버튼 그리드)
  - [x] 숫자 입력
  - [x] 사칙연산 (+, -, ×, ÷)
  - [x] 추가 기능 (%, √, 1/x)
  - [x] 키보드 입력 지원
  - [x] 메모리 기능 (MC, MR, MS, M+)
  - [x] 시작 메뉴 연동

- [x] **제어판 (Control Panel)**
  - [x] Control Panel 메인 화면
  - [x] Display 설정
    - [x] 배경 이미지 선택
    - [x] 색 구성표
  - [x] Mouse 설정
    - [x] 포인터 속도
    - [x] 더블클릭 속도
  - [x] Sound 설정
    - [x] 음량 조절
    - [x] 음소거 토글
  - [x] System 정보
    - [x] Windows 버전
    - [x] 프로젝트 정보

- [x] **작업 관리자 (Task Manager)**
  - [x] 열린 프로그램 목록
  - [x] 프로세스 종료 기능
  - [x] 메모리/CPU 사용률 표시 (가상)
  - [x] Ctrl+Alt+Delete로 실행

### 우선순위: 낮음 ⭐
- [x] **지뢰찾기 (Minesweeper)**
  - [x] 게임 보드 생성
  - [x] 지뢰 랜덤 배치
  - [x] 클릭 로직 (좌클릭/우클릭)
  - [x] 숫자 표시 (주변 지뢰 개수)
  - [x] 타이머
  - [x] 지뢰 카운터
  - [x] 난이도 선택 (초급/중급/고급)

- [ ] **그림판 (Paint)**
  - [ ] Canvas 기반 UI
  - [ ] 도구 팔레트
    - [ ] 펜슬
    - [ ] 브러시
    - [ ] 지우개
    - [ ] 사각형
    - [ ] 원
    - [ ] 텍스트
  - [ ] 색상 팔레트
  - [ ] 저장 기능 (이미지 다운로드)

---

## ✅ 완료된 디테일 개선 사항

### Notepad (완전 구현) ✅
- [x] 텍스트 편집, Word Wrap, 상태바
- [x] 찾기 기능 (Ctrl+F)
- [x] 마크다운 미리보기 (Ctrl+M)
- [x] New, Save, Exit, Select All
- [x] **Open... / Save As...** - localStorage 기반 파일 관리
- [x] **Undo/Redo** - 50단계 히스토리
- [x] **Cut/Copy/Paste/Delete** - Clipboard API 사용
- [x] **Find Next (F3)** - 다음 찾기
- [x] **Replace... (Ctrl+H)** - 찾아 바꾸기
- [x] **Font...** - 글꼴 크기 변경 (8px-72px)
- [x] 파일 저장 (localStorage)

### Explorer (완전 구현) ✅
- [x] API 연동, 파일/폴더 CRUD (서버)
- [x] Blog Posts 폴더 자동 생성
- [x] **Edit 메뉴** - Cut/Copy/Paste/Select All/Find
- [x] **View 메뉴** - 보기 모드, 정렬 (이름/종류/크기/날짜), 새로고침
- [x] **Go 메뉴** - Back/Forward/Up/My Computer/My Documents
- [x] **Favorites 메뉴** - 즐겨찾기 추가/관리 (localStorage)
- [x] **파일 검색** - 파일명 검색 다이얼로그
- [x] **파일 이름 변경** - F2 또는 메뉴에서 (서버 파일)
- [x] **키보드 단축키** - Ctrl+C/X/V/A/F, F2, F5, Delete, Backspace, Alt+화살표

### Desktop (완전 구현) ✅
- [x] 아이콘 정렬 (이름/종류/크기)
- [x] Auto Arrange, Line up Icons
- [x] **아이콘 위치 localStorage 저장** - 새로고침해도 유지
- [x] **새 폴더 만들기** - 실제 폴더 생성
- [x] **아이콘 삭제** - 확인 후 삭제
- [x] **아이콘 이름 변경** - 입력 다이얼로그
- [x] **다중 선택 (Ctrl+클릭)** - 여러 아이콘 선택
- [x] **범위 선택 (드래그)** - 드래그 박스로 범위 선택
- [x] **Cut/Copy/Paste** - 클립보드 기반 아이콘 복사/붙여넣기 (Ctrl+X/C/V)
- [x] **Paste Shortcut** - 바로가기 붙여넣기
- [x] **Properties** - 아이콘 속성 다이얼로그 (탭 UI)

### Window (완전 구현) ✅
- [x] 드래그 이동, 8방향 리사이즈
- [x] 최소화/최대화/닫기
- [x] **타이틀바 더블클릭** - 최대화/복원
- [x] **Alt+F4** - 포커스된 창 닫기
- [x] **창 애니메이션** - windowOpen 애니메이션
- [x] **Cascade Windows** - 계단식 배열
- [x] **Tile Windows** - 가로/세로 타일 배열
- [x] **창 개수 제한** - 최대 15개

### Control Panel (완전 구현) ✅
- [x] Display, Mouse, Sound, System 패널
- [x] **설정 localStorage 저장** - 새로고침해도 유지
- [x] **배경 이미지 변경** - Wallpaper 선택 (Clouds, Bliss, Matrix)
- [x] **마우스/더블클릭 속도** - 실제 적용 (soundManager 연동)

### 전역 키보드 단축키 (완전 구현) ✅
- [x] Ctrl+Alt+Delete (작업관리자)
- [x] **Alt+Tab** - 창 전환
- [x] **Alt+F4** - 포커스된 창 닫기
- [x] **Win+D** - 바탕화면 보기 토글
- [x] **Win+E** - 탐색기 열기
- [x] **F5** - 새로고침 (페이지 새로고침 방지)

---

## 🎨 UI/UX 개선

### 애니메이션 ✅
- [x] 창 열림/닫힘 애니메이션
- [x] 메뉴 슬라이드 애니메이션
- [x] 아이콘 호버 효과
- [x] 버튼 클릭 피드백

### 시각 효과 ✅
- [x] 창 그림자 개선
- [x] 포커스 아웃라인
- [x] 로딩 애니메이션 (LoadingSpinner 컴포넌트)
- [x] 진행률 표시 (ProgressDialog)

### 반응형
- [ ] 모바일 대응 (선택)
- [ ] 태블릿 대응 (선택)
- [ ] 최소 해상도 지원

---

## 🐛 버그 수정

### 수정된 버그
- [x] Start Menu 하위 메뉴 열리지 않는 문제
- [x] Control Panel 설정 변경 시 다른 설정이 초기화되는 문제

### 알려진 버그
- 없음 (현재까지 발견된 버그 없음)

### 테스트 필요
- [ ] 여러 창 동시 열기 (10개+)
- [ ] 큰 파일 텍스트 편집 (성능)
- [ ] 빠른 클릭/드래그 테스트
- [ ] 브라우저 호환성 (Chrome, Firefox, Safari)

---

## 📦 배포 준비

### 최적화
- [ ] 코드 분할 (React.lazy)
- [ ] 이미지 최적화
- [ ] 번들 크기 줄이기
- [ ] 메모이제이션 개선

### SEO & 메타데이터 ✅
- [x] index.html 메타 태그
- [x] Open Graph 태그
- [x] Favicon 추가 (SVG + PNG fallback)
- [x] site.webmanifest
- [x] robots.txt
- [ ] README.md 작성

### 문서화
- [x] PROGRESS.md
- [x] TODO.md
- [ ] CONTRIBUTING.md (선택)
- [ ] 코드 주석 개선

---

## 🗄️ Phase 4: 백엔드 & 데이터베이스

### 기술 스택
- **런타임**: Node.js
- **프레임워크**: Express.js
- **데이터베이스**: MongoDB
- **인증**: JWT (관리자 전용)
- **구조**: Monorepo (frontend/ + backend/)

### 백엔드 기본 구조 ✅
- [x] Express 프로젝트 초기화
- [x] MongoDB 연결 설정
- [x] 환경변수 설정 (.env)
- [x] CORS 설정
- [x] 에러 핸들링 미들웨어

### 인증 시스템 ✅
- [x] Admin 모델 (username, password hash)
- [x] 로그인 API (POST /api/auth/login)
- [x] JWT 발급 및 검증
- [x] 인증 미들웨어 (protected routes)
- [x] 초기 관리자 설정 API (POST /api/auth/setup)

### 블로그 시스템 ✅
- [x] Post 모델 (title, content, category, tags, createdAt, updatedAt, views)
- [x] 글 목록 조회 (GET /api/posts)
- [x] 글 상세 조회 (GET /api/posts/:id)
- [x] 글 작성 (POST /api/posts) [인증 필요]
- [x] 글 수정 (PUT /api/posts/:id) [인증 필요]
- [x] 글 삭제 (DELETE /api/posts/:id) [인증 필요]
- [x] 마크다운 지원 (프론트엔드 react-markdown)
- [x] 카테고리/태그 필터링

### 포트폴리오 시스템 ✅
- [x] Project 모델 (title, description, techStack, imageUrl, githubUrl, demoUrl, createdAt)
- [x] 프로젝트 목록 조회 (GET /api/projects)
- [x] 프로젝트 추가 (POST /api/projects) [인증 필요]
- [x] 프로젝트 수정 (PUT /api/projects/:id) [인증 필요]
- [x] 프로젝트 삭제 (DELETE /api/projects/:id) [인증 필요]
- [ ] 이미지 업로드 (Cloudinary 또는 S3)

### 가상 파일 시스템 ✅
- [x] File 모델 (name, type, content, parentId, createdAt, updatedAt)
- [x] 파일/폴더 트리 조회 (GET /api/files/tree)
- [x] 파일/폴더 생성 (POST /api/files) [인증 필요]
- [x] 파일/폴더 수정 (PUT /api/files/:id) [인증 필요]
- [x] 파일/폴더 삭제 (DELETE /api/files/:id) [인증 필요]
- [x] 폴더 내 파일 조회

### 방문자 통계 ✅
- [x] Visitor 모델 (ip, userAgent, page, timestamp)
- [x] 방문 기록 저장 (POST /api/stats/visit)
- [x] 통계 조회 (GET /api/stats) [인증 필요]
  - [x] 일별/주별/월별 방문자 수
  - [x] 페이지별 조회수
  - [x] 총 방문자 수

### 시스템 설정 ✅
- [x] Settings 모델 (key-value 저장)
- [x] 설정 조회 (GET /api/settings)
- [x] 설정 저장 (PUT /api/settings) [인증 필요]

### 프론트엔드 연동 ✅
- [x] API 서비스 레이어 생성 (src/services/api.js)
- [x] 환경변수로 API URL 관리
- [x] AuthContext 인증 상태 관리
- [x] 로그인 다이얼로그 (LoginDialog.jsx)
- [x] Blog 컴포넌트 API 연동 (CRUD, 카테고리, 태그)
- [x] Projects 컴포넌트 API 연동 (CRUD, featured)
- [x] Explorer API 연동 (서버 파일 생성/삭제/이동)
- [x] 로딩/에러 상태 처리

### 배포
- [ ] 백엔드 배포 (Railway / Render)
- [ ] MongoDB Atlas 설정
- [ ] 프론트엔드 배포 (Vercel / Netlify)
- [ ] 환경변수 설정
- [ ] 도메인 연결

---

## 🎯 선택적 고급 기능

### Easter Eggs
- [ ] Blue Screen of Death (BSOD) 이스터에그
- [ ] 숨겨진 게임
- [ ] 특별한 날짜 이벤트

### 테마
- [ ] Windows 95 테마
- [ ] Windows XP 테마 (선택)
- [ ] 다크 모드 (선택)

### 접근성
- [ ] 고대비 모드
- [ ] 큰 아이콘 모드
- [ ] 스크린 리더 지원
- [ ] 키보드 전용 네비게이션

---

## 📊 작업 통계

### 완료
- Phase 1 (기본 시스템): 19개 작업 ✅
- Phase 2 (핵심 앱): 20개 작업 ✅
- Phase 3 (추가 앱): 31개 작업 ✅
- Phase 4 (백엔드 + 연동): 25개 작업 ✅
- **디테일 개선: 36개 작업 ✅**
- **총 완료: 131개**

### 미구현 디테일
- Desktop: 0개 (모두 완료!)
- **총 미구현 디테일: 0개** ✅

### 배포
- 5개 작업 (백엔드/프론트엔드 배포, 도메인 연결)

### 진행률
- **Phase 1-3 핵심 기능: 100%** ✅
- **Phase 4 백엔드 API: 100%** ✅
- **Phase 4 프론트엔드 연동: 100%** ✅
- **디테일 완성도: 100%** ✅ (모든 디테일 완료!)
- **UI/UX 애니메이션: 100%** ✅
- **SEO 최적화: 100%** ✅
- **프론트엔드 배포 가능: YES** ✅

---

## 🚀 다음 단계 추천

### ✅ 완료된 우선순위 작업
1. ~~Desktop localStorage 저장~~ ✅
2. ~~Control Panel 설정 저장~~ ✅
3. ~~전역 키보드 단축키~~ ✅
4. ~~Window 개선~~ ✅
5. ~~Notepad/Explorer 완성~~ ✅

### 우선순위 1: 배포 🚀
- 백엔드 배포 (Railway/Render)
- MongoDB Atlas 설정
- 프론트엔드 배포 (Vercel/Netlify)
- 환경변수 설정
- 도메인 연결

### 선택 사항
- 그림판 (Paint)
- 이스터 에그 (BSOD 등)
- 추가 테마 (Windows 95, XP)

---

**작성일:** 2025-02-01
**마지막 업데이트:** 2026-02-03
