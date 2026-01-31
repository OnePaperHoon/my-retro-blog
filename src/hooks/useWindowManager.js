import { useState } from 'react';

const useWindowManager = () => {
  const [windows, setWindows] = useState([]);
  const [focusedWindow, setFocusedWindow] = useState(null);

  // 창 열기
  const openWindow = (id, title, content, options = {}) => {
    // 이미 열린 창이면 포커스만 변경
    const existingWindow = windows.find(w => w.id === id);
    if (existingWindow) {
      setFocusedWindow(id);
      // 최소화된 창이면 복원
      if (existingWindow.state === 'minimized') {
        setWindows(windows.map(w =>
          w.id === id ? { ...w, state: 'normal' } : w
        ));
      }
      return;
    }

    // Explorer나 큰 창을 위한 기본 크기 설정
    const defaultWidth = id === 'projects' || id === 'computer' ? 700 : 400;
    const defaultHeight = id === 'projects' || id === 'computer' ? 500 : 300;

    // 새 창 생성
    const newWindow = {
      id,
      title,
      content,
      x: 50 + windows.length * 30,
      y: 50 + windows.length * 30,
      width: options.width || defaultWidth,
      height: options.height || defaultHeight,
      state: 'normal', // normal, minimized, maximized
    };

    setWindows([...windows, newWindow]);
    setFocusedWindow(id);
  };

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
  const updateWindow = (id, updates) => {
    setWindows(windows.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  };

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
    updateWindow
  };
};

export default useWindowManager;
