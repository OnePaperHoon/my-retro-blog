import { WindowHeader, Button } from 'react95';
import soundManager from '../../utils/sounds';

const TitleBar = ({ title, isFocused, onMinimize, onMaximize, onClose, isMaximized }) => {
  return (
    <WindowHeader
      className="window-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isFocused ? '#000080' : '#808080',
        color: '#fff'
      }}
    >
      <span style={{ fontWeight: 'bold' }}>{title}</span>
      <div style={{ display: 'flex', gap: '2px' }}>
        <Button
          size="sm"
          square
          onClick={(e) => {
            e.stopPropagation();
            soundManager.minimize();
            onMinimize();
          }}
          style={{ width: '18px', height: '18px', padding: 0, fontSize: '10px' }}
        >
          <span style={{ fontWeight: 'bold' }}>_</span>
        </Button>
        <Button
          size="sm"
          square
          onClick={(e) => {
            e.stopPropagation();
            soundManager.maximize();
            onMaximize();
          }}
          style={{ width: '18px', height: '18px', padding: 0, fontSize: '10px' }}
        >
          <span style={{ fontWeight: 'bold' }}>{isMaximized ? '❐' : '□'}</span>
        </Button>
        <Button
          size="sm"
          square
          onClick={(e) => {
            e.stopPropagation();
            soundManager.windowClose();
            onClose();
          }}
          style={{ width: '18px', height: '18px', padding: 0, fontSize: '10px' }}
        >
          <span style={{ fontWeight: 'bold' }}>×</span>
        </Button>
      </div>
    </WindowHeader>
  );
};

export default TitleBar;
