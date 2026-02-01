import { useState } from 'react';
import { AppBar, Toolbar, Button } from 'react95';
import StartButton from './StartButton';
import SystemTray from './SystemTray';
import StartMenu from '../StartMenu/StartMenu';
import ContextMenu from '../ContextMenu/ContextMenu';
import Notepad from '../Notepad/Notepad';
import useContextMenu from '../../hooks/useContextMenu';

const Taskbar = ({ windows, focusedWindow, onFocusWindow, onRestoreWindow, onOpenWindow, onShowShutDown, showMessageBox, showConfirm, showInput, systemSettings, onSystemSettingsChange }) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  const handleStartClick = () => {
    setIsStartOpen(!isStartOpen);
  };

  const handleWindowButtonClick = (windowId) => {
    const window = windows.find(w => w.id === windowId);
    if (window.state === 'minimized') {
      onRestoreWindow(windowId);
    } else {
      onFocusWindow(windowId);
    }
  };

  const handleTaskbarContextMenu = (e) => {
    const menuItems = [
      {
        id: 'toolbars',
        label: 'Toolbars',
        icon: '🔧',
        submenu: [
          { id: 'address', label: 'Address', disabled: true },
          { id: 'links', label: 'Links', disabled: true },
          { id: 'desktop', label: 'Desktop', disabled: true }
        ]
      },
      { separator: true },
      {
        id: 'cascade',
        label: 'Cascade Windows',
        action: () => console.log('Cascade windows')
      },
      {
        id: 'tile-h',
        label: 'Tile Windows Horizontally',
        action: () => console.log('Tile horizontally')
      },
      {
        id: 'tile-v',
        label: 'Tile Windows Vertically',
        action: () => console.log('Tile vertically')
      },
      {
        id: 'minimize-all',
        label: 'Minimize All Windows',
        action: () => {
          windows.forEach(w => {
            if (w.state !== 'minimized') {
              onRestoreWindow(w.id); // 실제로는 minimizeWindow를 호출해야 함
            }
          });
        }
      },
      { separator: true },
      {
        id: 'task-manager',
        label: 'Task Manager',
        disabled: true
      },
      { separator: true },
      {
        id: 'properties',
        label: 'Properties',
        disabled: true
      }
    ];

    showContextMenu(e, menuItems);
  };

  return (
    <>
      <AppBar style={{ top: 'auto', bottom: 0 }} onContextMenu={handleTaskbarContextMenu}>
        <Toolbar style={{ justifyContent: 'space-between' }}>
        <div style={{ position: 'relative' }}>
          <StartButton isActive={isStartOpen} onClick={handleStartClick} />
          <StartMenu
            isOpen={isStartOpen}
            onClose={() => setIsStartOpen(false)}
            onOpenWindow={onOpenWindow}
            onShowShutDown={onShowShutDown}
            showMessageBox={showMessageBox}
            showConfirm={showConfirm}
            showInput={showInput}
            systemSettings={systemSettings}
            onSystemSettingsChange={onSystemSettingsChange}
          />
        </div>

        {/* 작업 표시줄 중앙: 열린 프로그램들 표시 */}
        <div style={{ flex: 1, marginLeft: '10px', display: 'flex', gap: '2px' }}>
          {windows.map((win) => (
            <Button
              key={win.id}
              active={focusedWindow === win.id && win.state !== 'minimized'}
              onClick={() => handleWindowButtonClick(win.id)}
              style={{
                width: '140px',
                justifyContent: 'flex-start',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {win.title}
            </Button>
          ))}
        </div>

        <SystemTray />
      </Toolbar>
    </AppBar>

    {/* 컨텍스트 메뉴 */}
    {contextMenu && (
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={hideContextMenu}
      />
    )}
  </>
  );
};

export default Taskbar;
