import { WindowHeader, Button } from 'react95';

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
