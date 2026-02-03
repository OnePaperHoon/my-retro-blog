import { useState, useCallback } from 'react';
import soundManager from '../utils/sounds';

const MAX_WINDOWS = 15;

const useWindowManager = () => {
  const [windows, setWindows] = useState([]);
  const [focusedWindow, setFocusedWindow] = useState(null);

  // 창 열기
  const openWindow = useCallback((id, title, content, options = {}) => {
    setWindows(prevWindows => {
      // 이미 열린 창이면 포커스만 변경
      const existingWindow = prevWindows.find(w => w.id === id);
      if (existingWindow) {
        setFocusedWindow(id);
        // 최소화된 창이면 복원
        if (existingWindow.state === 'minimized') {
          return prevWindows.map(w =>
            w.id === id ? { ...w, state: 'normal' } : w
          );
        }
        return prevWindows;
      }

      // 창 개수 제한
      if (prevWindows.length >= MAX_WINDOWS) {
        soundManager.error();
        console.warn(`Maximum number of windows (${MAX_WINDOWS}) reached`);
        return prevWindows;
      }

      // Explorer나 큰 창을 위한 기본 크기 설정
      const defaultWidth = id === 'projects' || id === 'computer' ? 700 : 400;
      const defaultHeight = id === 'projects' || id === 'computer' ? 500 : 300;

      // 창 크기
      const winWidth = options.width || defaultWidth;
      const winHeight = options.height || defaultHeight;

      // 화면 중앙 계산 (작업표시줄 46px 제외)
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight - 46;
      const centerX = Math.max(0, (screenWidth - winWidth) / 2);
      const centerY = Math.max(0, (screenHeight - winHeight) / 2);

      // 여러 창이 겹치지 않도록 오프셋 추가
      const offset = (prevWindows.length % 5) * 30;

      // 새 창 생성
      const newWindow = {
        id,
        title,
        content,
        x: centerX + offset,
        y: centerY + offset,
        width: winWidth,
        height: winHeight,
        state: 'normal', // normal, minimized, maximized
      };

      setFocusedWindow(id);
      soundManager.windowOpen();
      return [...prevWindows, newWindow];
    });
  }, []);

  // 창 닫기
  const closeWindow = (id) => {
    setWindows(windows.filter(w => w.id !== id));
    if (focusedWindow === id) {
      setFocusedWindow(null);
    }
  };

  // 창 포커스
  const focusWindow = (id) => {
    setFocusedWindow(id);
  };

  // 창 최소화
  const minimizeWindow = (id) => {
    setWindows(windows.map(w =>
      w.id === id ? { ...w, state: 'minimized' } : w
    ));
    if (focusedWindow === id) {
      setFocusedWindow(null);
    }
  };

  // 창 최대화/복원
  const maximizeWindow = (id) => {
    setWindows(windows.map(w => {
      if (w.id === id) {
        return {
          ...w,
          state: w.state === 'maximized' ? 'normal' : 'maximized'
        };
      }
      return w;
    }));
  };

  // 창 복원 (최소화 -> normal)
  const restoreWindow = (id) => {
    setWindows(windows.map(w =>
      w.id === id ? { ...w, state: 'normal' } : w
    ));
    setFocusedWindow(id);
  };

  // 창 크기 조절
  const resizeWindow = (id, width, height) => {
    setWindows(windows.map(w =>
      w.id === id ? { ...w, width, height } : w
    ));
  };

  // 창 위치 및 크기 조절
  const updateWindow = useCallback((id, updates) => {
    setWindows(prevWindows => prevWindows.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  // Cascade Windows - 창들을 계단식으로 배열
  const cascadeWindows = useCallback(() => {
    setWindows(prevWindows => prevWindows.map((w, i) => ({
      ...w,
      x: 30 + i * 30,
      y: 30 + i * 30,
      state: 'normal'
    })));
    soundManager.click();
  }, []);

  // Tile Windows Horizontally - 창들을 가로로 타일 배열
  const tileWindowsHorizontally = useCallback(() => {
    const visibleWindows = windows.filter(w => w.state !== 'minimized');
    if (visibleWindows.length === 0) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 46;
    const windowWidth = Math.floor(screenWidth / visibleWindows.length);

    setWindows(prevWindows => {
      let visibleIndex = 0;
      return prevWindows.map(w => {
        if (w.state === 'minimized') return w;
        const result = {
          ...w,
          x: visibleIndex * windowWidth,
          y: 0,
          width: windowWidth,
          height: screenHeight,
          state: 'normal'
        };
        visibleIndex++;
        return result;
      });
    });
    soundManager.click();
  }, [windows]);

  // Tile Windows Vertically - 창들을 세로로 타일 배열
  const tileWindowsVertically = useCallback(() => {
    const visibleWindows = windows.filter(w => w.state !== 'minimized');
    if (visibleWindows.length === 0) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 46;
    const windowHeight = Math.floor(screenHeight / visibleWindows.length);

    setWindows(prevWindows => {
      let visibleIndex = 0;
      return prevWindows.map(w => {
        if (w.state === 'minimized') return w;
        const result = {
          ...w,
          x: 0,
          y: visibleIndex * windowHeight,
          width: screenWidth,
          height: windowHeight,
          state: 'normal'
        };
        visibleIndex++;
        return result;
      });
    });
    soundManager.click();
  }, [windows]);

  // 모든 창 최소화 (Win+D)
  const minimizeAll = useCallback(() => {
    setWindows(prevWindows => prevWindows.map(w => ({ ...w, state: 'minimized' })));
    setFocusedWindow(null);
    soundManager.minimize();
  }, []);

  // 모든 창 복원
  const restoreAll = useCallback(() => {
    setWindows(prevWindows => prevWindows.map(w => ({ ...w, state: 'normal' })));
    soundManager.click();
  }, []);

  // 다음 창으로 포커스 이동 (Alt+Tab)
  const focusNextWindow = useCallback(() => {
    if (windows.length === 0) return;

    const visibleWindows = windows.filter(w => w.state !== 'minimized');
    if (visibleWindows.length === 0) {
      // 최소화된 창 복원
      if (windows.length > 0) {
        const firstWindow = windows[0];
        setWindows(prevWindows => prevWindows.map(w =>
          w.id === firstWindow.id ? { ...w, state: 'normal' } : w
        ));
        setFocusedWindow(firstWindow.id);
      }
      return;
    }

    const currentIndex = visibleWindows.findIndex(w => w.id === focusedWindow);
    const nextIndex = (currentIndex + 1) % visibleWindows.length;
    setFocusedWindow(visibleWindows[nextIndex].id);
    soundManager.click();
  }, [windows, focusedWindow]);

  return {
    windows,
    focusedWindow,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    resizeWindow,
    updateWindow,
    cascadeWindows,
    tileWindowsHorizontally,
    tileWindowsVertically,
    minimizeAll,
    restoreAll,
    focusNextWindow
  };
};

export default useWindowManager;
