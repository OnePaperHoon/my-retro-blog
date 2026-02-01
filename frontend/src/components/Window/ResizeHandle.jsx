import { useState, useEffect, useCallback } from 'react';

const ResizeHandle = ({ direction, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const getCursor = () => {
    const cursors = {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
      sw: 'nesw-resize'
    };
    return cursors[direction] || 'default';
  };

  const getPosition = () => {
    const positions = {
      n: { top: '-4px', left: '4px', right: '4px', height: '8px', cursor: 'ns-resize' },
      s: { bottom: '-4px', left: '4px', right: '4px', height: '8px', cursor: 'ns-resize' },
      e: { right: '-4px', top: '4px', bottom: '4px', width: '8px', cursor: 'ew-resize' },
      w: { left: '-4px', top: '4px', bottom: '4px', width: '8px', cursor: 'ew-resize' },
      ne: { top: '-4px', right: '-4px', width: '12px', height: '12px', cursor: 'nesw-resize' },
      nw: { top: '-4px', left: '-4px', width: '12px', height: '12px', cursor: 'nwse-resize' },
      se: { bottom: '-4px', right: '-4px', width: '12px', height: '12px', cursor: 'nwse-resize' },
      sw: { bottom: '-4px', left: '-4px', width: '12px', height: '12px', cursor: 'nesw-resize' }
    };
    return positions[direction] || {};
  };

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });

    // 현재 창 크기 가져오기
    const windowElement = e.target.closest('[data-window]');
    if (windowElement) {
      const rect = windowElement.getBoundingClientRect();
      setStartSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    let newWidth = startSize.width;
    let newHeight = startSize.height;
    let deltaPosition = { x: 0, y: 0 };

    // 방향에 따라 크기 계산
    if (direction.includes('e')) {
      newWidth = startSize.width + deltaX;
    }
    if (direction.includes('w')) {
      newWidth = startSize.width - deltaX;
      deltaPosition.x = deltaX;
    }
    if (direction.includes('s')) {
      newHeight = startSize.height + deltaY;
    }
    if (direction.includes('n')) {
      newHeight = startSize.height - deltaY;
      deltaPosition.y = deltaY;
    }

    // 최소 크기 제한
    const minWidth = 200;
    const minHeight = 150;

    if (newWidth < minWidth) {
      newWidth = minWidth;
      deltaPosition.x = 0;
    }
    if (newHeight < minHeight) {
      newHeight = minHeight;
      deltaPosition.y = 0;
    }

    onResize({
      width: newWidth,
      height: newHeight,
      deltaX: deltaPosition.x,
      deltaY: deltaPosition.y
    });
  }, [isResizing, startPos, startSize, direction, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = getCursor();
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const positionStyle = getPosition();

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        ...positionStyle,
        zIndex: 10
      }}
    />
  );
};

export default ResizeHandle;
