import { useState, useEffect } from 'react';

const SystemTray = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div
        style={{
          padding: '3px 10px',
          border: '2px inset #ffffff',
          backgroundColor: '#c6c6c6',
          fontSize: '13px',
          minWidth: '70px',
          textAlign: 'center'
        }}
      >
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default SystemTray;
