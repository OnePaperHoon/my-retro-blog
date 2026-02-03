import { useRef, useEffect, useState } from 'react';
import { Window, WindowHeader, WindowContent, Button, ProgressBar } from 'react95';
import Draggable from 'react-draggable';

const ProgressDialog = ({
  title = 'Progress',
  message = 'Please wait...',
  progress = 0, // 0-100, or -1 for indeterminate
  onCancel,
  showCancel = false,
  autoClose = false,
  onComplete
}) => {
  const nodeRef = useRef(null);
  const [internalProgress, setInternalProgress] = useState(progress);

  // Indeterminate progress animation
  useEffect(() => {
    if (progress === -1) {
      const interval = setInterval(() => {
        setInternalProgress(prev => (prev >= 100 ? 0 : prev + 2));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setInternalProgress(progress);
    }
  }, [progress]);

  // Auto close when complete
  useEffect(() => {
    if (autoClose && progress === 100 && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, autoClose, onComplete]);

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
    >
      <Draggable nodeRef={nodeRef} handle=".dialog-header">
        <div
          ref={nodeRef}
          style={{
            width: '350px',
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
            </WindowHeader>
            <WindowContent style={{ padding: '20px' }}>
              {/* Message */}
              <div style={{ marginBottom: '15px', fontSize: '12px' }}>
                {message}
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '15px' }}>
                <ProgressBar
                  value={progress === -1 ? internalProgress : Math.min(100, Math.max(0, progress))}
                  hideValue={progress === -1}
                />
              </div>

              {/* Progress percentage */}
              {progress !== -1 && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#666',
                  marginBottom: showCancel ? '15px' : '0'
                }}>
                  {Math.round(progress)}% Complete
                </div>
              )}

              {/* Cancel Button */}
              {showCancel && (
                <div style={{ textAlign: 'center' }}>
                  <Button onClick={onCancel} style={{ minWidth: '80px' }}>
                    Cancel
                  </Button>
                </div>
              )}
            </WindowContent>
          </Window>
        </div>
      </Draggable>
    </div>
  );
};

export default ProgressDialog;
