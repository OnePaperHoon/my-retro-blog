import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import soundManager from '../../utils/sounds';

const DesktopIcon = ({ name, iconUrl, onDoubleClick, selected, onSelect, onContextMenu, position, onDrag }) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef(null);

  const handleDrag = (e, data) => {
    if (onDrag) {
      onDrag(data.deltaX, data.deltaY);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onDrag={handleDrag}
      onStart={(e) => {
        // 드래그 시작 시 선택
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        ref={nodeRef}
        onClick={(e) => {
          e.stopPropagation();
          soundManager.select();
          onSelect();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
        onContextMenu={onContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'center',
          padding: '4px',
          position: 'absolute',
          backgroundColor: selected ? 'rgba(0, 0, 128, 0.5)' : 'transparent',
          border: selected ? '1px dotted #fff' : '1px dotted transparent'
        }}
      >
        <img
          src={iconUrl}
          alt={name}
          style={{
            width: '40px',
            height: '40px',
            marginBottom: '4px',
            filter: isHovered && !selected ? 'brightness(1.2)' : 'none',
            pointerEvents: 'none'
          }}
        />
        <span
          style={{
            color: 'white',
            fontSize: '12px',
            padding: '2px 4px',
            textShadow: '1px 1px 2px #000',
            backgroundColor: selected ? '#000080' : 'transparent',
            borderRadius: '2px',
            wordBreak: 'break-word',
            pointerEvents: 'none'
          }}
        >
          {name}
        </span>
      </div>
    </Draggable>
  );
};

export default DesktopIcon;
