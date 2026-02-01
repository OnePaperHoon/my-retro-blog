import { useRef, useEffect } from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import Draggable from 'react-draggable';

const Dialog = ({
  title,
  children,
  onClose,
  buttons = [],
  width = 400,
  icon = 'ℹ️'
}) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <Draggable nodeRef={nodeRef} handle=".dialog-header">
        <div
          ref={nodeRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: `${width}px`,
            position: 'relative'
          }}
        >
          <Window shadow>
            <WindowHeader className="dialog-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#000080',
              color: '#fff'
            }}>
              <span style={{ fontWeight: 'bold' }}>{title}</span>
              {onClose && (
                <Button
                  size='sm'
                  square
                  onClick={onClose}
                  style={{ width: '18px', height: '18px', padding: 0 }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '10px' }}>×</span>
                </Button>
              )}
            </WindowHeader>
            <WindowContent style={{ padding: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                {icon && (
                  <div style={{
                    fontSize: '32px',
                    marginRight: '15px',
                    flexShrink: 0
                  }}>
                    {icon}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  {children}
                </div>
              </div>

              {buttons.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '20px'
                }}>
                  {buttons.map((btn, index) => (
                    <Button
                      key={index}
                      onClick={btn.onClick}
                      disabled={btn.disabled}
                      primary={btn.primary}
                      style={{ minWidth: '80px' }}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              )}
            </WindowContent>
          </Window>
        </div>
      </Draggable>
    </div>
  );
};

export default Dialog;
