const LoadingSpinner = ({
  size = 32,
  color = '#000080',
  text = 'Loading...',
  showText = true
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Windows 98 style hourglass spinner */}
      <div
        className="loading-spinner"
        style={{
          width: size,
          height: size,
          fontSize: size,
          lineHeight: 1
        }}
      >
        ⏳
      </div>
      {showText && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#000'
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

// Full-screen loading overlay
export const LoadingOverlay = ({ message = 'Please wait...' }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(192, 192, 192, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        textAlign: 'center',
        padding: '30px',
        backgroundColor: '#c0c0c0',
        border: '2px outset #c0c0c0'
      }}>
        <div
          className="loading-spinner"
          style={{
            fontSize: '48px',
            marginBottom: '15px'
          }}
        >
          ⏳
        </div>
        <div style={{ fontSize: '12px' }}>{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
