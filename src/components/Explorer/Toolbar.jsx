import { Button, Separator } from 'react95';

const Toolbar = ({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onUp,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px',
      backgroundColor: '#c0c0c0',
      borderBottom: '2px solid #808080'
    }}>
      {/* 네비게이션 버튼 */}
      <Button
        onClick={onBack}
        disabled={!canGoBack}
        size="sm"
        title="Back"
      >
        ←
      </Button>
      <Button
        onClick={onForward}
        disabled={!canGoForward}
        size="sm"
        title="Forward"
      >
        →
      </Button>
      <Button
        onClick={onUp}
        size="sm"
        title="Up"
      >
        ⬆
      </Button>

      <Separator orientation="vertical" style={{ height: '20px', margin: '0 4px' }} />

      {/* 보기 방식 버튼 */}
      <Button
        onClick={() => onViewModeChange('icons')}
        active={viewMode === 'icons'}
        size="sm"
        title="Large Icons"
      >
        🔳
      </Button>
      <Button
        onClick={() => onViewModeChange('list')}
        active={viewMode === 'list'}
        size="sm"
        title="List"
      >
        ☰
      </Button>
      <Button
        onClick={() => onViewModeChange('details')}
        active={viewMode === 'details'}
        size="sm"
        title="Details"
      >
        📋
      </Button>
    </div>
  );
};

export default Toolbar;
