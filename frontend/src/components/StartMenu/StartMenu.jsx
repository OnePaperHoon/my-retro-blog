import { MenuList } from 'react95';
import MenuItem from './MenuItem';
import Notepad from '../Notepad/Notepad';
import Calculator from '../Calculator/Calculator';
import ControlPanel from '../ControlPanel/ControlPanel';
import Minesweeper from '../Minesweeper/Minesweeper';
import Browser from '../Browser/Browser';
import Blog from '../Blog/Blog';
import Projects from '../Projects/Projects';

const StartMenu = ({ isOpen, onClose, onOpenWindow, onShowShutDown, showMessageBox, showConfirm, showInput, systemSettings, onSystemSettingsChange }) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'programs',
      label: 'Programs',
      icon: '📂',
      submenu: [
        {
          id: 'internet',
          label: 'Internet Explorer',
          icon: '🌐',
          action: () => {
            onOpenWindow(
              'internet',
              'Internet Explorer',
              <Browser showMessageBox={showMessageBox} />,
              { width: 900, height: 650 }
            );
          }
        },
        {
          id: 'blog',
          label: 'My Blog',
          icon: '📝',
          action: () => {
            onOpenWindow(
              'blog',
              'My Blog',
              <Blog showMessageBox={showMessageBox} showConfirm={showConfirm} />,
              { width: 800, height: 600 }
            );
          }
        },
        {
          id: 'projects',
          label: 'My Projects',
          icon: '💼',
          action: () => {
            onOpenWindow(
              'projects',
              'My Projects',
              <Projects showMessageBox={showMessageBox} showConfirm={showConfirm} />,
              { width: 800, height: 600 }
            );
          }
        },
        { separator: true },
        {
          id: 'games',
          label: 'Games',
          icon: '🎮',
          submenu: [
            {
              id: 'minesweeper',
              label: 'Minesweeper',
              icon: '💣',
              action: () => {
                onOpenWindow(
                  'minesweeper',
                  'Minesweeper',
                  <Minesweeper />,
                  { width: 300, height: 380 }
                );
              }
            }
          ]
        },
        {
          id: 'accessories',
          label: 'Accessories',
          icon: '🔧',
          submenu: [
            {
              id: 'notepad',
              label: 'Notepad',
              icon: '📝',
              action: () => {
                onOpenWindow(
                  'notepad-' + Date.now(),
                  'Untitled - Notepad',
                  <Notepad
                    showMessageBox={showMessageBox}
                    showConfirm={showConfirm}
                    showInput={showInput}
                  />,
                  { width: 600, height: 500 }
                );
              }
            },
            {
              id: 'calculator',
              label: 'Calculator',
              icon: '🔢',
              action: () => {
                onOpenWindow(
                  'calculator-' + Date.now(),
                  'Calculator',
                  <Calculator />,
                  { width: 240, height: 320 }
                );
              }
            }
          ]
        }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: '📄',
      disabled: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      submenu: [
        {
          id: 'control-panel',
          label: 'Control Panel',
          icon: '🛠️',
          action: () => {
            onOpenWindow(
              'control-panel',
              'Control Panel',
              <ControlPanel
                settings={systemSettings}
                onSettingsChange={onSystemSettingsChange}
              />,
              { width: 400, height: 300 }
            );
          }
        }
      ]
    },
    {
      id: 'find',
      label: 'Find',
      icon: '🔍',
      disabled: true
    },
    { separator: true },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      disabled: true
    },
    {
      id: 'run',
      label: 'Run...',
      icon: '🏃',
      disabled: true
    },
    { separator: true },
    {
      id: 'shutdown',
      label: 'Shut Down...',
      icon: '🔌',
      action: () => {
        onClose();
        setTimeout(() => onShowShutDown(), 100);
      }
    }
  ];

  const handleMenuClick = (item) => {
    if (item.action) {
      item.action();
      onClose();
    }
  };

  return (
    <MenuList
      className="start-menu"
      style={{
        position: 'absolute',
        left: '0',
        bottom: '100%',
        zIndex: '9999',
        minWidth: '200px'
      }}
    >
      <div
        style={{
          backgroundColor: '#000080',
          color: '#fff',
          padding: '8px 12px',
          fontWeight: 'bold',
          fontSize: '14px',
          borderBottom: '2px solid #c0c0c0'
        }}
      >
        OnePaperHoon
      </div>
      {menuItems.map((item, index) => (
        <MenuItem
          key={item.id || `sep-${index}`}
          item={item}
          onClick={() => handleMenuClick(item)}
          hasSubmenu={item.submenu && item.submenu.length > 0}
          onSubmenuAction={onClose}
        />
      ))}
    </MenuList>
  );
};

export default StartMenu;
