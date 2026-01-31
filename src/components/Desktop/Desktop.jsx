import { useState } from 'react';
import DesktopIcon from './DesktopIcon';
import ContextMenu from '../ContextMenu/ContextMenu';
import useContextMenu from '../../hooks/useContextMenu';
import Explorer from '../Explorer/Explorer';
import Notepad from '../Notepad/Notepad';

const Desktop = ({ onOpenWindow, showMessageBox, showConfirm, showInput }) => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  const [desktopIcons, setDesktopIcons] = useState([
    {
      id: 'computer',
      name: 'My Computer',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png',
      content: '여기는 시스템 폴더입니다.',
      position: { x: 10, y: 10 }
    },
    {
      id: 'documents',
      name: 'My Documents',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png',
      content: '내 문서 폴더입니다.',
      position: { x: 10, y: 120 }
    },
    {
      id: 'blog',
      name: 'Study Blog',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/notepad-0.png',
      content: '오늘의 공부: 리액트로 Windows 98 시뮬레이션 만들기 성공!',
      position: { x: 10, y: 230 }
    },
    {
      id: 'projects',
      name: 'Projects',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/directory_closed_cool-4.png',
      content: 'My Portfolio Projects',
      position: { x: 10, y: 340 }
    },
    {
      id: 'resume',
      name: 'Resume',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/notepad_file-0.png',
      content: 'My Resume / CV',
      position: { x: 10, y: 450 }
    },
    {
      id: 'trash',
      name: 'Recycle Bin',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-4.png',
      content: '비어 있음',
      position: { x: 10, y: 560 }
    }
  ]);

  const handleDesktopClick = () => {
    setSelectedIcon(null);
    hideContextMenu();
  };

  const handleDesktopContextMenu = (e) => {
    const handleNewFolder = async () => {
      if (showInput) {
        const folderName = await showInput('Enter folder name:', {
          title: 'New Folder',
          placeholder: 'New Folder',
          defaultValue: 'New Folder'
        });

        if (folderName) {
          showMessageBox(`Folder "${folderName}" would be created here.\n\n(Feature not fully implemented yet)`, 'info', 'New Folder');
        }
      }
    };

    const handleRefresh = () => {
      if (showMessageBox) {
        showMessageBox('Desktop refreshed!', 'info', 'Refresh');
      }
      // 실제로는 아이콘 위치 재정렬 등
    };

    const menuItems = [
      {
        id: 'arrange',
        label: 'Arrange Icons',
        icon: '📋',
        submenu: [
          { id: 'by-name', label: 'by Name', action: () => console.log('Sort by name') },
          { id: 'by-type', label: 'by Type', action: () => console.log('Sort by type') },
          { id: 'by-size', label: 'by Size', action: () => console.log('Sort by size') },
          { separator: true },
          { id: 'auto-arrange', label: 'Auto Arrange', action: () => console.log('Auto arrange') }
        ]
      },
      {
        id: 'line-up',
        label: 'Line up Icons',
        action: () => console.log('Line up icons')
      },
      { separator: true },
      {
        id: 'refresh',
        label: 'Refresh',
        action: handleRefresh
      },
      { separator: true },
      {
        id: 'paste',
        label: 'Paste',
        disabled: true
      },
      {
        id: 'paste-shortcut',
        label: 'Paste Shortcut',
        disabled: true
      },
      { separator: true },
      {
        id: 'new',
        label: 'New',
        icon: '📄',
        submenu: [
          { id: 'new-folder', label: 'Folder', icon: '📁', action: handleNewFolder },
          { id: 'new-shortcut', label: 'Shortcut', disabled: true }
        ]
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

  const handleIconSelect = (iconId) => {
    setSelectedIcon(iconId);
  };

  const handleIconDoubleClick = (icon) => {
    // 파일을 Notepad로 열기
    const handleOpenFile = (file) => {
      onOpenWindow(
        `file-${file.id}`,
        `${file.name} - Notepad`,
        <Notepad
          initialContent={file.content || `File: ${file.name}\nType: ${file.type}\nSize: ${file.size || 'N/A'}`}
          fileName={file.name}
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
          showInput={showInput}
        />,
        { width: 600, height: 500 }
      );
    };

    if (icon.id === 'projects' || icon.id === 'computer') {
      // Explorer로 열기
      onOpenWindow(
        icon.id,
        icon.name,
        <Explorer
          onOpenFile={handleOpenFile}
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
          showInput={showInput}
        />
      );
    } else if (icon.id === 'blog') {
      // Blog는 Notepad로 직접 열기
      onOpenWindow(
        icon.id,
        `${icon.name} - Notepad`,
        <Notepad
          initialContent={icon.content || 'Start writing your blog post...'}
          fileName={icon.name}
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
          showInput={showInput}
        />,
        { width: 600, height: 500 }
      );
    } else {
      onOpenWindow(icon.id, icon.name, icon.content);
    }
  };

  const handleIconContextMenu = (e, icon) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedIcon(icon.id);

    const handleDelete = async () => {
      if (showConfirm) {
        const confirmed = await showConfirm(
          `Are you sure you want to delete "${icon.name}"?`,
          {
            title: 'Confirm Delete',
            type: 'question',
            buttonType: 'yesno'
          }
        );

        if (confirmed) {
          showMessageBox(`"${icon.name}" has been deleted.\n\n(Feature not fully implemented yet)`, 'info', 'Delete');
        }
      }
    };

    const handleRename = async () => {
      if (showInput) {
        const newName = await showInput('Enter new name:', {
          title: 'Rename',
          defaultValue: icon.name
        });

        if (newName && newName !== icon.name) {
          showMessageBox(`Renamed to "${newName}".\n\n(Feature not fully implemented yet)`, 'info', 'Rename');
        }
      }
    };

    const menuItems = [
      {
        id: 'open',
        label: 'Open',
        action: () => handleIconDoubleClick(icon)
      },
      { separator: true },
      {
        id: 'cut',
        label: 'Cut',
        disabled: true
      },
      {
        id: 'copy',
        label: 'Copy',
        disabled: true
      },
      { separator: true },
      {
        id: 'delete',
        label: 'Delete',
        action: handleDelete
      },
      {
        id: 'rename',
        label: 'Rename',
        action: handleRename
      },
      { separator: true },
      {
        id: 'properties',
        label: 'Properties',
        action: () => onOpenWindow(`${icon.id}-props`, `${icon.name} Properties`, `Properties of ${icon.name}`)
      }
    ];

    showContextMenu(e, menuItems);
  };

  const handleIconDrag = (iconId, deltaX, deltaY) => {
    setDesktopIcons(icons =>
      icons.map(icon =>
        icon.id === iconId
          ? {
              ...icon,
              position: {
                x: Math.max(0, icon.position.x + deltaX),
                y: Math.max(0, icon.position.y + deltaY)
              }
            }
          : icon
      )
    );
  };

  return (
    <>
      <div
        onClick={handleDesktopClick}
        onContextMenu={handleDesktopContextMenu}
        style={{
          width: '100%',
          height: 'calc(100vh - 46px)', // 작업표시줄 높이 제외
          position: 'relative'
        }}
      >
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            name={icon.name}
            iconUrl={icon.iconUrl}
            position={icon.position}
            selected={selectedIcon === icon.id}
            onSelect={() => handleIconSelect(icon.id)}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            onContextMenu={(e) => handleIconContextMenu(e, icon)}
            onDrag={(deltaX, deltaY) => handleIconDrag(icon.id, deltaX, deltaY)}
          />
        ))}
      </div>

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

export default Desktop;
