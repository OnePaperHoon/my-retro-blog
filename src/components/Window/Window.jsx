import { useRef, useState, useCallback } from 'react';
import { Window as Win95Window, WindowContent } from 'react95';
import Draggable from 'react-draggable';
import TitleBar from './TitleBar';
import ResizeHandle from './ResizeHandle';

const Window = ({
  window,
  isFocused,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onResize
}) => {
  const nodeRef = useRef(null);
  const [currentSize, setCurrentSize] = useState({
    width: window.width || 400,
    height: window.height || 300
  });
  const [currentPosition, setCurrentPosition] = useState({
    x: window.x || 0,
    y: window.y || 0
  });

  const isMaximized = window.state === 'maximized';
  const isMinimized = window.state === 'minimized';

  // 리사이즈 핸들러
  const handleResize = useCallback(({ width, height, deltaX, deltaY }) => {
    setCurrentSize({ width, height });

    // 위쪽이나 왼쪽으로 리사이즈할 때 위치도 조정
    if (deltaX !== 0 || deltaY !== 0) {
      setCurrentPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }

    // 부모 컴포넌트에 크기 및 위치 변경 알림
    if (onResize) {
      onResize(window.id, {
        width,
        height,
        x: currentPosition.x + deltaX,
        y: currentPosition.y + deltaY
      });
    }
  }, [window.id, onResize, currentPosition]);

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
        position: 'absolute',
        left: currentPosition.x,
        top: currentPosition.y,
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
    <Draggable nodeRef={nodeRef} handle=".window-header">
      {content}
    </Draggable>
  );
};

export default Window;
