import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import LoginDialog from '../Dialog/LoginDialog';

const TrayContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrayIcon = styled.div`
  padding: 2px 6px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid transparent;

  &:hover {
    border: 1px outset #ffffff;
  }

  &:active {
    border: 1px inset #ffffff;
  }
`;

const TimeDisplay = styled.div`
  padding: 3px 10px;
  border: 2px inset #ffffff;
  background-color: #c6c6c6;
  font-size: 13px;
  min-width: 70px;
  text-align: center;
`;

const AdminBadge = styled.span`
  font-size: 10px;
  background: #000080;
  color: white;
  padding: 1px 4px;
  margin-left: 4px;
`;

const SystemTray = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isAuthenticated, admin, logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      if (window.confirm('Are you sure you want to logout?')) {
        logout();
      }
    } else {
      setShowLoginDialog(true);
    }
  };

  return (
    <>
      <TrayContainer>
        <TrayIcon
          onClick={handleAuthClick}
          title={isAuthenticated ? `Logged in as ${admin?.username}. Click to logout.` : 'Click to login as administrator'}
        >
          {isAuthenticated ? '👤' : '🔒'}
          {isAuthenticated && <AdminBadge>Admin</AdminBadge>}
        </TrayIcon>
        <TimeDisplay>
          {formatTime(currentTime)}
        </TimeDisplay>
      </TrayContainer>

      {showLoginDialog && (
        <LoginDialog onClose={() => setShowLoginDialog(false)} />
      )}
    </>
  );
};

export default SystemTray;
