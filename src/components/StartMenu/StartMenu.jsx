import { MenuList } from 'react95';
import MenuItem from './MenuItem';
import Notepad from '../Notepad/Notepad';

const StartMenu = ({ isOpen, onClose, onOpenWindow, onShowShutDown, showMessageBox, showConfirm, showInput }) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'programs',
      label: 'Programs',
      icon: '📂',
      submenu: [
        {
          id: 'about',
          label: 'About Me',
          icon: '💻',
          action: () => onOpenWindow('about', 'About Me', 'OnePaperHoon - Full Stack Developer')
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: '📁',
          action: () => onOpenWindow('projects', 'Projects', 'My Portfolio Projects')
        },
        {
          id: 'blog',
          label: 'Blog',
          icon: '📝',
          action: () => onOpenWindow('blog', 'Blog', 'Study Blog & Tech Articles')
        },
        {
          id: 'resume',
          label: 'Resume',
          icon: '📄',
          action: () => onOpenWindow('resume', 'Resume', 'My Resume / CV')
        },
        { separator: true },
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
            { id: 'calculator', label: 'Calculator', icon: '🔢', disabled: true }
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
      disabled: true
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
      style={{
        position: 'absolute',
        left: '0',
        bottom: '100%',
        zIndex: '9999',
        minWidth: '200px'
      }}
      onClick={onClose}
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
        />
      ))}
    </MenuList>
  );
};

export default StartMenu;
