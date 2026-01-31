# 🖥️ Windows 98 OS 시뮬레이션 - 프로젝트 진행 상황

**마지막 업데이트:** 2025-02-01
**프로젝트 상태:** Phase 2 완료 ✅

---

## 📊 전체 진행도

### Phase 1: 기본 시스템 (100% 완료 ✅)
- [x] 부팅 화면 (BIOS + Windows 98 로고 + 로딩바)
- [x] 바탕화면 (아이콘 선택, 드래그 이동)
- [x] 시작 메뉴 (Programs 하위 메뉴, Shut Down)
- [x] 작업 표시줄 (시작 버튼, 창 목록, 시계)
- [x] 창 시스템 (이동, 크기조절, 최소화/최대화)
- [x] 우클릭 컨텍스트 메뉴
- [x] Shut Down 다이얼로그

### Phase 2: 핵심 애플리케이션 (100% 완료 ✅)
- [x] 파일 탐색기 (Explorer)
- [x] 다이얼로그 시스템 (MessageBox, Confirm, Input)
- [x] 메모장 (Notepad)
- [x] 내 컴퓨터 (Explorer로 구현)

### Phase 3: 추가 기능 (선택 사항)
- [ ] 계산기 (Calculator)
- [ ] 그림판 (Paint)
- [ ] 지뢰찾기 (Minesweeper)
- [ ] 제어판 (Control Panel)
- [ ] 작업 관리자 (Task Manager)
- [ ] 사운드 효과
- [ ] 애니메이션 개선

---

## 🗂️ 현재 파일 구조

```
my-retro-blog/
├── src/
│   ├── components/
│   │   ├── Boot/
│   │   │   └── BootScreen.jsx                    ✅ 완성
│   │   ├── Desktop/
│   │   │   ├── Desktop.jsx                       ✅ 완성
│   │   │   └── DesktopIcon.jsx                   ✅ 완성
│   │   ├── StartMenu/
│   │   │   ├── StartMenu.jsx                     ✅ 완성
│   │   │   └── MenuItem.jsx                      ✅ 완성
│   │   ├── Taskbar/
│   │   │   ├── Taskbar.jsx                       ✅ 완성
│   │   │   ├── StartButton.jsx                   ✅ 완성
│   │   │   └── SystemTray.jsx                    ✅ 완성
│   │   ├── Window/
│   │   │   ├── Window.jsx                        ✅ 완성 (드래그, 리사이즈)
│   │   │   ├── TitleBar.jsx                      ✅ 완성
│   │   │   └── ResizeHandle.jsx                  ✅ 완성
│   │   ├── ContextMenu/
│   │   │   └── ContextMenu.jsx                   ✅ 완성
│   │   ├── Dialog/
│   │   │   ├── Dialog.jsx                        ✅ 완성 (기본)
│   │   │   ├── MessageBox.jsx                    ✅ 완성
│   │   │   ├── ConfirmDialog.jsx                 ✅ 완성
│   │   │   ├── InputDialog.jsx                   ✅ 완성
│   │   │   ├── ShutDownDialog.jsx                ✅ 완성
│   │   │   └── DialogManager.jsx                 ✅ 완성
│   │   ├── Explorer/
│   │   │   ├── Explorer.jsx                      ✅ 완성
│   │   │   ├── FolderTree.jsx                    ✅ 완성
│   │   │   ├── FileList.jsx                      ✅ 완성
│   │   │   ├── Toolbar.jsx                       ✅ 완성
│   │   │   └── AddressBar.jsx                    ✅ 완성
│   │   └── Notepad/
│   │       └── Notepad.jsx                       ✅ 완성
│   ├── hooks/
│   │   ├── useWindowManager.js                   ✅ 완성
│   │   ├── useContextMenu.js                     ✅ 완성
│   │   └── useDialog.js                          ✅ 완성
│   ├── data/
│   │   └── fileSystem.js                         ✅ 완성 (포트폴리오 데이터)
│   ├── App.jsx                                   ✅ 완성
│   └── main.jsx                                  ✅ 완성
├── package.json
└── vite.config.js
```

---

## 🎯 구현된 주요 기능

### 1. 부팅 시스템
- BIOS 화면 (1초)
- Windows 98 로고 + 로딩바 (5단계)
- OnePaperHoon.com 브랜딩

### 2. 바탕화면
- 6개 아이콘 (My Computer, Documents, Blog, Projects, Resume, Recycle Bin)
- 싱글 클릭 선택 (파란색 하이라이트)
- 더블 클릭 실행
- **드래그로 위치 이동** ⭐
- 우클릭 메뉴 (Arrange Icons, Refresh, New Folder, Properties)

### 3. 시작 메뉴
- Programs 하위 메뉴 (About, Projects, Blog, Resume, Accessories)
- Accessories → Notepad 실행
- Shut Down 다이얼로그 (Shut down, Restart, Log off)

### 4. 작업 표시줄
- 시작 버튼
- 열린 창 목록 (클릭으로 전환/복원)
- 시스템 트레이 (시계)
- 우클릭 메뉴 (Cascade/Tile Windows)

### 5. 창 시스템
- 드래그로 이동
- **8방향 크기 조절** (상/하/좌/우 + 모서리)
- 최소화/최대화/닫기 버튼
- Z-Index 포커스 관리
- 활성/비활성 색상

### 6. 파일 탐색기
- **2패널 레이아웃** (폴더 트리 + 파일 목록)
- **3가지 보기 방식** (Large Icons, List, Details)
- 네비게이션 (뒤로/앞으로/상위)
- 주소 표시줄
- 상태 표시줄
- 파일 더블클릭 → Notepad로 열기

### 7. 다이얼로그 시스템
- **MessageBox** (Info, Warning, Error, Question)
- **ConfirmDialog** (Yes/No, OK/Cancel, Yes/No/Cancel)
- **InputDialog** (텍스트 입력)
- **ShutDownDialog** (시스템 종료)
- Promise 기반 API

### 8. 메모장
- 완전한 메뉴 시스템 (File, Edit, Format, View, Help)
- 텍스트 편집
- Word Wrap 토글
- 상태 표시줄 (줄/열 위치)
- 찾기 기능 (Ctrl+F)
- 키보드 단축키 (Ctrl+S, Ctrl+N, Ctrl+A)

---

## 🚀 다음 작업 우선순위

### 즉시 작업 가능 (난이도: 하)
1. **사운드 효과 추가**
   - Windows 98 시작 음악
   - 버튼 클릭 소리
   - 에러/알림 소리
   - 파일: `src/utils/sounds.js`

2. **아이콘 정렬 기능 구현**
   - Desktop 우클릭 → Arrange Icons 활성화
   - 이름/종류/크기순 정렬
   - Auto Arrange 기능
   - 파일: `src/components/Desktop/Desktop.jsx`

### 중간 작업 (난이도: 중)
3. **계산기 (Calculator)**
   - 기본 사칙연산
   - Windows 98 스타일 UI
   - 키보드 입력 지원
   - 새 폴더: `src/components/Calculator/`

4. **제어판 (Control Panel)**
   - Display (배경, 테마)
   - Mouse (속도, 더블클릭)
   - System (정보)
   - 새 폴더: `src/components/ControlPanel/`

### 고급 작업 (난이도: 상)
5. **지뢰찾기 (Minesweeper)**
   - 게임 로직
   - 난이도 선택 (초급/중급/고급)
   - 타이머, 지뢰 카운터
   - 새 폴더: `src/components/Minesweeper/`

6. **그림판 (Paint)**
   - Canvas 기반 드로잉
   - 도구 선택 (펜, 지우개, 사각형, 원)
   - 색상 팔레트
   - 새 폴더: `src/components/Paint/`

---

## 📝 개발 가이드

### 새 컴포넌트 추가하기

#### 1. 새 애플리케이션 만들기 (예: Calculator)

```bash
# 폴더 생성
mkdir src/components/Calculator
```

```jsx
// src/components/Calculator/Calculator.jsx
import { useState } from 'react';

const Calculator = ({ showMessageBox }) => {
  const [display, setDisplay] = useState('0');

  // 계산기 로직...

  return (
    <div style={{ padding: '10px' }}>
      {/* 계산기 UI */}
    </div>
  );
};

export default Calculator;
```

#### 2. 시작 메뉴에 등록

```jsx
// src/components/StartMenu/StartMenu.jsx
import Calculator from '../Calculator/Calculator';

// menuItems에 추가
{
  id: 'calculator',
  label: 'Calculator',
  icon: '🔢',
  action: () => {
    onOpenWindow(
      'calc-' + Date.now(),
      'Calculator',
      <Calculator
        showMessageBox={showMessageBox}
        showConfirm={showConfirm}
        showInput={showInput}
      />,
      { width: 300, height: 400 }
    );
  }
}
```

#### 3. 바탕화면 아이콘으로 추가 (선택)

```jsx
// src/components/Desktop/Desktop.jsx
const [desktopIcons, setDesktopIcons] = useState([
  // ... 기존 아이콘들
  {
    id: 'calculator',
    name: 'Calculator',
    iconUrl: 'https://win98icons.alexmeub.com/icons/png/calculator-0.png',
    content: <Calculator />,
    position: { x: 10, y: 670 }
  }
]);
```

---

## 🎨 디자인 시스템

### Windows 98 색상
```css
--desktop-background: #008080;      /* Teal */
--window-background: #c0c0c0;       /* Silver */
--active-title: #000080;            /* Navy Blue */
--inactive-title: #808080;          /* Gray */
--button-face: #c0c0c0;
--button-highlight: #ffffff;
--button-shadow: #808080;
```

### 타이포그래피
```css
font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
font-size: 13px;  /* 메뉴, 버튼 */
font-size: 11px;  /* 작은 텍스트 */
```

### 3D 효과 (볼록)
```css
border-top: 2px solid #ffffff;
border-left: 2px solid #ffffff;
border-right: 2px solid #808080;
border-bottom: 2px solid #808080;
```

---

## 🐛 알려진 이슈 & 개선 사항

### 개선 필요
1. **Notepad**
   - [ ] Undo/Redo 기능
   - [ ] 실제 파일 저장 (localStorage)
   - [ ] Cut/Copy/Paste 구현
   - [ ] 글꼴 변경 기능

2. **Explorer**
   - [ ] 파일 검색 기능
   - [ ] 새 폴더 만들기 실제 구현
   - [ ] 파일 삭제/이름 변경 실제 구현
   - [ ] 드래그 앤 드롭 파일 이동

3. **Desktop**
   - [ ] 아이콘 정렬 기능 활성화
   - [ ] 아이콘 위치 localStorage 저장
   - [ ] 다중 선택 (Ctrl+클릭, Shift+클릭)

4. **Window**
   - [ ] 창 애니메이션 (최소화/최대화)
   - [ ] 더블클릭으로 최대화/복원
   - [ ] Alt+Tab 창 전환

### 버그
- 없음 (현재까지 발견된 버그 없음)

---

## 📚 참고 자료

### 사용 중인 라이브러리
- **react95**: Windows 95/98 UI 컴포넌트
- **react-draggable**: 드래그 기능
- **styled-components**: CSS-in-JS

### 아이콘 리소스
- https://win98icons.alexmeub.com/

### Windows 98 레퍼런스
- [Windows 98 UI Guidelines](https://learn.microsoft.com/en-us/windows/win32/uxguide/guidelines)
- [react95 문서](https://react95.io/)

---

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview

# Lint
npm run lint
```

---

## 💡 구현 팁

### 1. 다이얼로그 사용하기
```javascript
// MessageBox
await showMessageBox('작업 완료!', 'info', '알림');

// Confirm
const confirmed = await showConfirm('삭제하시겠습니까?');
if (confirmed) {
  // 삭제 로직
}

// Input
const name = await showInput('이름을 입력하세요:');
if (name) {
  // 이름 사용
}
```

### 2. 창 열기
```javascript
onOpenWindow(
  'window-id',           // 고유 ID
  'Window Title',        // 창 제목
  <Component />,         // 내용 (React 컴포넌트)
  { width: 600, height: 500 }  // 옵션 (크기 등)
);
```

### 3. 컨텍스트 메뉴
```javascript
const menuItems = [
  {
    id: 'action1',
    label: 'Action 1',
    icon: '📝',
    action: () => console.log('Action 1')
  },
  { separator: true },
  {
    id: 'submenu',
    label: 'Submenu',
    submenu: [
      { id: 'sub1', label: 'Sub 1', action: () => {} }
    ]
  }
];

showContextMenu(e, menuItems);
```

---

## 🎯 프로젝트 목표

이 프로젝트는 **Windows 98 스타일의 포트폴리오 웹사이트**입니다.

### 핵심 목표
- ✅ 레트로 감성의 독특한 UI/UX
- ✅ 포트폴리오 프로젝트를 파일 탐색기로 탐색
- ✅ README.md를 메모장으로 읽기
- ✅ 완전한 인터랙티브 경험

### 완성도
- **Phase 1-2**: 100% 완료
- **전체 프로젝트**: 80% 완료
- **배포 준비**: 가능 (추가 기능은 선택사항)

---

## 📞 다음 작업 시작하기

### 추천 작업 순서
1. 사운드 효과 추가 (분위기 UP)
2. 계산기 구현 (비교적 간단)
3. 아이콘 정렬 기능 (UX 개선)
4. 지뢰찾기 구현 (재미 요소)

### 시작하려면
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
http://localhost:5173
```

**테스트 시나리오:**
1. 부팅 화면 확인
2. Projects 아이콘 더블클릭 → Explorer
3. README.md 더블클릭 → Notepad
4. 메뉴, 다이얼로그, 우클릭 메뉴 테스트

---

**마지막 업데이트:** 2025-02-01
**다음 목표:** Phase 3 - 추가 애플리케이션 구현

🎉 **수고하셨습니다! 핵심 기능은 모두 완성되었습니다!** 🎉
