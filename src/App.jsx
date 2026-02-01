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
import useWindowManager from './hooks/useWindowManager';
import useDialog from './hooks/useDialog';
import soundManager from './utils/sounds';

// 글로벌 스타일 (동적 배경색 지원)
const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${props => props.$backgroundColor || '#008080'};
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  }

  * {
    box-sizing: border-box;
  }
`;

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [showShutDownDialog, setShowShutDownDialog] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    backgroundColor: '#008080',
    soundMuted: false,
    soundVolume: 50
  });

  const {
    windows,
    focusedWindow,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindow
  } = useWindowManager();

  const {
    dialog,
    showMessageBox,
    showConfirm,
    showInput
  } = useDialog();

  const handleBootComplete = () => {
    setIsBooting(false);
  };

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

  // Ctrl+Alt+Delete handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key === 'Delete') {
        e.preventDefault();
        openTaskManager();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openTaskManager]);

  if (isBooting) {
    return (
      <ThemeProvider theme={original}>
        <GlobalStyles $backgroundColor={systemSettings.backgroundColor} />
        <BootScreen onBootComplete={handleBootComplete} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={original}>
      <GlobalStyles $backgroundColor={systemSettings.backgroundColor} />

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
