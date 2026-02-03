import { useState, useEffect, useCallback } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import original from 'react95/dist/themes/original';

import BootScreen from './components/Boot/BootScreen';
import Desktop from './components/Desktop/Desktop';
import Taskbar from './components/Taskbar/Taskbar';
import Window from './components/Window/Window';
import ShutDownDialog from './components/Dialog/ShutDownDialog';
import DialogManager from './components/Dialog/DialogManager';
import Notepad from './components/Notepad/Notepad';
import TaskManager from './components/TaskManager/TaskManager';
import Explorer from './components/Explorer/Explorer';
import useWindowManager from './hooks/useWindowManager';
import useDialog from './hooks/useDialog';
import soundManager from './utils/sounds';
import { statsAPI } from './services/api';

// 글로벌 스타일 (동적 배경색 및 이미지 지원)
const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${props => props.$backgroundColor || '#008080'};
    ${props => props.$backgroundImage ? `
      background-image: url(${props.$backgroundImage});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    ` : ''}
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  /* 창 열기 애니메이션 - scale 사용 안함 (Draggable transform과 충돌) */
  @keyframes windowOpen {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// localStorage에서 시스템 설정 로드
const SYSTEM_SETTINGS_KEY = 'system_settings';
const DEFAULT_SETTINGS = {
  backgroundColor: '#008080',
  backgroundImage: null,
  soundMuted: false,
  soundVolume: 50,
  doubleClickSpeed: 500,
  pointerSpeed: 5
};

const loadSystemSettings = () => {
  try {
    const saved = localStorage.getItem(SYSTEM_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load system settings:', e);
  }
  return DEFAULT_SETTINGS;
};

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [showShutDownDialog, setShowShutDownDialog] = useState(false);
  const [systemSettings, setSystemSettings] = useState(() => loadSystemSettings());

  // 설정 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(systemSettings));

    // 사운드 설정 적용
    if (soundManager) {
      soundManager.setMute(systemSettings.soundMuted);
      soundManager.setVolume(systemSettings.soundVolume / 100);
    }
  }, [systemSettings]);

  const {
    windows,
    focusedWindow,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindow,
    cascadeWindows,
    tileWindowsHorizontally,
    tileWindowsVertically,
    minimizeAll,
    restoreAll,
    focusNextWindow
  } = useWindowManager();

  // 바탕화면 표시 토글 상태
  const [isDesktopShown, setIsDesktopShown] = useState(false);

  const {
    dialog,
    showMessageBox,
    showConfirm,
    showInput
  } = useDialog();

  const handleBootComplete = () => {
    setIsBooting(false);
  };

  // 방문자 통계 기록
  useEffect(() => {
    const recordVisit = async () => {
      try {
        await statsAPI.recordVisit('/', document.referrer || null);
      } catch (error) {
        console.log('Failed to record visit:', error.message);
      }
    };
    recordVisit();
  }, []);

  // Open Task Manager
  const openTaskManager = useCallback(() => {
    soundManager.windowOpen();
    openWindow(
      'task-manager',
      'Windows Task Manager',
      <TaskManager
        windows={windows}
        onCloseWindow={closeWindow}
        onFocusWindow={focusWindow}
      />,
      { width: 400, height: 350 }
    );
  }, [openWindow, windows, closeWindow, focusWindow]);

  // Explorer 열기 함수
  const openExplorer = useCallback(() => {
    const handleOpenFile = (file) => {
      openWindow(
        `file-${file.id}`,
        `${file.name} - Notepad`,
        <Notepad
          initialContent={file.content || ''}
          fileName={file.name}
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
          showInput={showInput}
        />,
        { width: 600, height: 500 }
      );
    };

    soundManager.windowOpen();
    openWindow(
      'explorer-' + Date.now(),
      'Windows Explorer',
      <Explorer
        initialPath="C:\\My Documents"
        onOpenFile={handleOpenFile}
        showMessageBox={showMessageBox}
        showConfirm={showConfirm}
        showInput={showInput}
      />,
      { width: 750, height: 500 }
    );
  }, [openWindow, showMessageBox, showConfirm, showInput]);

  // 전역 키보드 단축키 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Alt+Delete: 작업 관리자
      if (e.ctrlKey && e.altKey && e.key === 'Delete') {
        e.preventDefault();
        openTaskManager();
        return;
      }

      // Alt+Tab: 창 전환
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        focusNextWindow();
        return;
      }

      // Win+D (Meta+D): 바탕화면 보기 토글
      if ((e.metaKey || e.key === 'Meta') && e.key === 'd') {
        e.preventDefault();
        if (isDesktopShown) {
          restoreAll();
          setIsDesktopShown(false);
        } else {
          minimizeAll();
          setIsDesktopShown(true);
        }
        return;
      }

      // Win+E (Meta+E): 탐색기 열기
      if ((e.metaKey || e.key === 'Meta') && e.key === 'e') {
        e.preventDefault();
        openExplorer();
        return;
      }

      // F5: 새로고침 (페이지 새로고침 방지, 앱 내 새로고침)
      if (e.key === 'F5') {
        e.preventDefault();
        soundManager.click();
        // 포커스된 창 새로고침 효과 (실제로는 아무것도 하지 않음)
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openTaskManager, focusNextWindow, minimizeAll, restoreAll, isDesktopShown, openExplorer]);

  if (isBooting) {
    return (
      <ThemeProvider theme={original}>
        <GlobalStyles $backgroundColor={systemSettings.backgroundColor} $backgroundImage={systemSettings.backgroundImage} />
        <BootScreen onBootComplete={handleBootComplete} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={original}>
      <GlobalStyles $backgroundColor={systemSettings.backgroundColor} $backgroundImage={systemSettings.backgroundImage} />

      {/* 바탕화면 */}
      <Desktop
        onOpenWindow={openWindow}
        showMessageBox={showMessageBox}
        showConfirm={showConfirm}
        showInput={showInput}
      />

      {/* 열린 창들 */}
      {windows.map((win) => (
        <Window
          key={win.id}
          window={win}
          isFocused={focusedWindow === win.id}
          onClose={() => closeWindow(win.id)}
          onFocus={() => focusWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximizeWindow(win.id)}
          onResize={(id, updates) => updateWindow(id, updates)}
          onPositionChange={(id, pos) => updateWindow(id, pos)}
        />
      ))}

      {/* 작업 표시줄 */}
      <Taskbar
        windows={windows}
        focusedWindow={focusedWindow}
        onFocusWindow={focusWindow}
        onRestoreWindow={restoreWindow}
        onOpenWindow={openWindow}
        onShowShutDown={() => setShowShutDownDialog(true)}
        showMessageBox={showMessageBox}
        showConfirm={showConfirm}
        showInput={showInput}
        systemSettings={systemSettings}
        onSystemSettingsChange={setSystemSettings}
        onCascadeWindows={cascadeWindows}
        onTileWindowsHorizontally={tileWindowsHorizontally}
        onTileWindowsVertically={tileWindowsVertically}
        onMinimizeAll={minimizeAll}
      />

      {/* Shut Down 다이얼로그 */}
      {showShutDownDialog && (
        <ShutDownDialog onClose={() => setShowShutDownDialog(false)} />
      )}

      {/* 다이얼로그 매니저 */}
      <DialogManager dialog={dialog} />
    </ThemeProvider>
  );
}

export default App;
