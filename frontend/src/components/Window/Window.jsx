import { useRef, useState, useCallback, useEffect } from 'react';
import { Window as Win95Window, WindowContent } from 'react95';
import Draggable from 'react-draggable';
import TitleBar from './TitleBar';
import ResizeHandle from './ResizeHandle';
import soundManager from '../../utils/sounds';

const Window = ({
  window,
  isFocused,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onResize,
  onPositionChange
}) => {
  const nodeRef = useRef(null);
  const [currentSize, setCurrentSize] = useState({
    width: window.width || 400,
    height: window.height || 300
  });

  const isMaximized = window.state === 'maximized';
  const isMinimized = window.state === 'minimized';

  // Alt+F4로 창 닫기
  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        soundManager.windowClose();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, onClose]);

  // 드래그 완료 핸들러 - 부모에게 위치 저장
  const handleDragStop = useCallback((e, data) => {
    if (onPositionChange) {
      onPositionChange(window.id, { x: data.x, y: data.y });
    }
  }, [window.id, onPositionChange]);

  // 리사이즈 핸들러
  const handleResize = useCallback(({ width, height, deltaX, deltaY }) => {
    setCurrentSize({ width, height });

    // 위쪽이나 왼쪽으로 리사이즈할 때 위치도 조정
    if (onResize) {
      onResize(window.id, {
        width,
        height,
        x: (window.x || 0) + deltaX,
        y: (window.y || 0) + deltaY
      });
    }

    if (onPositionChange && (deltaX !== 0 || deltaY !== 0)) {
      onPositionChange(window.id, {
        x: (window.x || 0) + deltaX,
        y: (window.y || 0) + deltaY
      });
    }
  }, [window.id, window.x, window.y, onResize, onPositionChange]);

  if (isMinimized) {
    return null; // 최소화된 창은 렌더링하지 않음
  }

  const windowStyle = isMaximized
    ? {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: 'calc(100vh - 46px)', // 작업표시줄 높이 제외
        zIndex: isFocused ? 100 : 10,
      }
    : {
        position: 'fixed',
        left: 0,
        top: 0,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
        zIndex: isFocused ? 100 : 10,
      };

  const content = (
    <div
      ref={nodeRef}
      style={windowStyle}
      onMouseDown={onFocus}
      data-window
    >
      <Win95Window style={{ width: '100%', height: '100%', position: 'relative' }} shadow={isFocused}>
        <TitleBar
          title={window.title}
          isFocused={isFocused}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          isMaximized={isMaximized}
        />
        <WindowContent
          style={{
            backgroundColor: '#fff',
            height: isMaximized ? 'calc(100% - 33px)' : `${currentSize.height - 60}px`,
            overflowY: 'auto',
            padding: '10px'
          }}
        >
          {window.content}
        </WindowContent>

        {/* 리사이즈 핸들 (최대화 상태가 아닐 때만) */}
        {!isMaximized && (
          <>
            <ResizeHandle direction="n" onResize={handleResize} />
            <ResizeHandle direction="s" onResize={handleResize} />
            <ResizeHandle direction="e" onResize={handleResize} />
            <ResizeHandle direction="w" onResize={handleResize} />
            <ResizeHandle direction="ne" onResize={handleResize} />
            <ResizeHandle direction="nw" onResize={handleResize} />
            <ResizeHandle direction="se" onResize={handleResize} />
            <ResizeHandle direction="sw" onResize={handleResize} />
          </>
        )}
      </Win95Window>
    </div>
  );

  // 최대화된 창은 드래그 불가
  if (isMaximized) {
    return content;
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-header"
      position={{ x: window.x || 0, y: window.y || 0 }}
      onStop={handleDragStop}
    >
      {content}
    </Draggable>
  );
};

export default Window;
