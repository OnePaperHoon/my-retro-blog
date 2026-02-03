import { useState } from 'react';
import soundManager from '../../utils/sounds';

const ControlPanelItem = ({ icon, label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => {
        soundManager.click();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '80px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: isHovered ? 'rgba(0, 0, 128, 0.1)' : 'transparent',
        border: isHovered ? '1px dotted #000080' : '1px dotted transparent',
        textAlign: 'center'
      }}
    >
      <img
        src={icon}
        alt={label}
        style={{ width: '32px', height: '32px', marginBottom: '4px' }}
      />
      <span style={{ fontSize: '11px', wordBreak: 'break-word' }}>{label}</span>
    </div>
  );
};

const DisplaySettings = ({ settings, onSettingsChange, onClose }) => {
  const backgrounds = [
    { id: 'teal', name: 'Teal (Default)', color: '#008080' },
    { id: 'blue', name: 'Blue', color: '#000080' },
    { id: 'forest', name: 'Forest', color: '#254117' },
    { id: 'purple', name: 'Purple', color: '#4B0082' },
    { id: 'black', name: 'Black', color: '#000000' },
    { id: 'gray', name: 'Gray', color: '#808080' }
  ];

  const wallpapers = [
    { id: 'none', name: '(None)', url: null },
    { id: 'clouds', name: 'Clouds', url: 'https://i.imgur.com/7QJwNqL.jpg' },
    { id: 'bliss', name: 'Bliss', url: 'https://i.imgur.com/2oZklXn.jpg' },
    { id: 'matrix', name: 'Matrix', url: 'https://i.imgur.com/JgYD2nQ.jpg' }
  ];

  return (
    <div style={{ padding: '12px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Display Properties</h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
          Background Color:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {backgrounds.map(bg => (
            <div
              key={bg.id}
              onClick={() => {
                soundManager.click();
                onSettingsChange({ ...settings, backgroundColor: bg.color, backgroundImage: null });
              }}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: bg.color,
                border: settings.backgroundColor === bg.color && !settings.backgroundImage ? '3px solid #000' : '1px solid #808080',
                cursor: 'pointer'
              }}
              title={bg.name}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
          Wallpaper:
        </label>
        <select
          value={settings.backgroundImage || 'none'}
          onChange={(e) => {
            soundManager.click();
            const selected = wallpapers.find(w => w.id === e.target.value);
            onSettingsChange({ ...settings, backgroundImage: selected?.url || null });
          }}
          style={{ width: '100%', padding: '4px', fontSize: '12px' }}
        >
          {wallpapers.map(wp => (
            <option key={wp.id} value={wp.id}>{wp.name}</option>
          ))}
        </select>
      </div>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <button
          onClick={() => {
            soundManager.click();
            onClose();
          }}
          style={{
            padding: '4px 16px',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const MouseSettings = ({ settings, onSettingsChange, onClose }) => {
  return (
    <div style={{ padding: '12px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Mouse Properties</h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
          Double-click Speed:
        </label>
        <input
          type="range"
          min="200"
          max="900"
          value={1100 - (settings.doubleClickSpeed || 500)}
          onChange={(e) => {
            const speed = 1100 - parseInt(e.target.value);
            onSettingsChange({ ...settings, doubleClickSpeed: speed });
          }}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
          Pointer Speed:
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={settings.pointerSpeed || 5}
          onChange={(e) => {
            onSettingsChange({ ...settings, pointerSpeed: parseInt(e.target.value) });
          }}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <button
          onClick={() => {
            soundManager.click();
            onClose();
          }}
          style={{
            padding: '4px 16px',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const SystemInfo = ({ onClose }) => {
  return (
    <div style={{ padding: '12px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <img
          src="https://win98icons.alexmeub.com/icons/png/windows-0.png"
          alt="Windows"
          style={{ width: '48px', height: '48px' }}
        />
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Microsoft Windows 98</h3>
          <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Second Edition</p>
        </div>
      </div>

      <div style={{
        backgroundColor: '#f0f0f0',
        border: '1px solid #808080',
        padding: '12px',
        fontSize: '12px',
        lineHeight: '1.8'
      }}>
        <div><strong>System:</strong> Windows 98 SE Simulation</div>
        <div><strong>Processor:</strong> Intel Pentium II 400MHz</div>
        <div><strong>Memory:</strong> 64.0 MB RAM</div>
        <div style={{ marginTop: '12px', borderTop: '1px solid #ccc', paddingTop: '12px' }}>
          <strong>Project:</strong> OnePaperHoon Portfolio
        </div>
        <div><strong>Built with:</strong> React + React95</div>
        <div><strong>Version:</strong> 1.0.0</div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <button
          onClick={() => {
            soundManager.click();
            onClose();
          }}
          style={{
            padding: '4px 16px',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const SoundSettings = ({ settings, onSettingsChange, onClose }) => {
  return (
    <div style={{ padding: '12px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Sound Properties</h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <input
            type="checkbox"
            checked={!settings.soundMuted}
            onChange={(e) => {
              soundManager.click();
              const muted = !e.target.checked;
              soundManager.setMute(muted);
              onSettingsChange({ ...settings, soundMuted: muted });
            }}
          />
          Enable sounds
        </label>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
          Volume:
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={(settings.soundVolume || 50)}
          disabled={settings.soundMuted}
          onChange={(e) => {
            const volume = parseInt(e.target.value) / 100;
            soundManager.setVolume(volume);
            soundManager.click();
            onSettingsChange({ ...settings, soundVolume: parseInt(e.target.value) });
          }}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <button
          onClick={() => {
            soundManager.click();
            onClose();
          }}
          style={{
            padding: '4px 16px',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const ControlPanel = ({ settings: propSettings, onSettingsChange }) => {
  const [currentView, setCurrentView] = useState('main');

  // 기본 설정값
  const defaultSettings = {
    backgroundColor: '#008080',
    doubleClickSpeed: 500,
    pointerSpeed: 5,
    soundMuted: false,
    soundVolume: 50
  };

  // 로컬 상태로 설정 관리 (props를 초기값으로 사용)
  const [localSettings, setLocalSettings] = useState({
    ...defaultSettings,
    ...propSettings
  });

  // 현재 설정값
  const settings = localSettings;

  const handleSettingsChange = (newSettings) => {
    // 로컬 상태 업데이트
    setLocalSettings(newSettings);
    // 부모 컴포넌트에도 전달
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleCloseSubPanel = () => {
    setCurrentView('main');
  };

  const items = [
    {
      id: 'display',
      icon: 'https://win98icons.alexmeub.com/icons/png/display_properties-0.png',
      label: 'Display'
    },
    {
      id: 'mouse',
      icon: 'https://win98icons.alexmeub.com/icons/png/mouse-0.png',
      label: 'Mouse'
    },
    {
      id: 'sounds',
      icon: 'https://win98icons.alexmeub.com/icons/png/loudspeaker_rays-0.png',
      label: 'Sounds'
    },
    {
      id: 'system',
      icon: 'https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png',
      label: 'System'
    }
  ];

  if (currentView === 'display') {
    return (
      <DisplaySettings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={handleCloseSubPanel}
      />
    );
  }

  if (currentView === 'mouse') {
    return (
      <MouseSettings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={handleCloseSubPanel}
      />
    );
  }

  if (currentView === 'sounds') {
    return (
      <SoundSettings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={handleCloseSubPanel}
      />
    );
  }

  if (currentView === 'system') {
    return <SystemInfo onClose={handleCloseSubPanel} />;
  }

  return (
    <div style={{ padding: '8px' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {items.map(item => (
          <ControlPanelItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;
