import { useState, useCallback } from 'react';
import DesktopIcon from './DesktopIcon';
import ContextMenu from '../ContextMenu/ContextMenu';
import useContextMenu from '../../hooks/useContextMenu';
import Explorer from '../Explorer/Explorer';
import Notepad from '../Notepad/Notepad';
import Blog from '../Blog/Blog';
import Projects from '../Projects/Projects';
import Browser from '../Browser/Browser';
import soundManager from '../../utils/sounds';

// Icon grid settings for auto-arrange and line-up
const GRID_SPACING_X = 90;
const GRID_SPACING_Y = 100;
const GRID_PADDING = 10;

const Desktop = ({ onOpenWindow, showMessageBox, showConfirm, showInput }) => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [autoArrange, setAutoArrange] = useState(false);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  const [desktopIcons, setDesktopIcons] = useState([
    {
      id: 'computer',
      name: 'My Computer',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png',
      content: '여기는 시스템 폴더입니다.',
      type: 'system',
      size: 0,
      position: { x: 10, y: 10 }
    },
    {
      id: 'documents',
      name: 'My Documents',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png',
      content: '내 문서 폴더입니다.',
      type: 'folder',
      size: 0,
      position: { x: 10, y: 110 }
    },
    {
      id: 'internet',
      name: 'Internet Explorer',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/msie1-2.png',
      content: 'Internet Browser',
      type: 'app',
      size: 0,
      position: { x: 10, y: 210 }
    },
    {
      id: 'blog',
      name: 'My Blog',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/html-4.png',
      content: 'Blog Application',
      type: 'app',
      size: 0,
      position: { x: 10, y: 310 }
    },
    {
      id: 'projects',
      name: 'My Projects',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/briefcase-0.png',
      content: 'Portfolio Projects',
      type: 'app',
      size: 0,
      position: { x: 10, y: 410 }
    },
    {
      id: 'trash',
      name: 'Recycle Bin',
      iconUrl: 'https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-4.png',
      content: '비어 있음',
      type: 'system',
      size: 0,
      position: { x: 10, y: 510 }
    }
  ]);

  // Calculate grid position for an index
  const getGridPosition = useCallback((index) => {
    const maxRows = Math.floor((window.innerHeight - 46 - GRID_PADDING * 2) / GRID_SPACING_Y);
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    return {
      x: GRID_PADDING + col * GRID_SPACING_X,
      y: GRID_PADDING + row * GRID_SPACING_Y
    };
  }, []);

  // Arrange icons in grid order
  const arrangeIconsInGrid = useCallback((iconsToArrange) => {
    return iconsToArrange.map((icon, index) => ({
      ...icon,
      position: getGridPosition(index)
    }));
  }, [getGridPosition]);

  // Sort by name (alphabetically)
  const sortByName = useCallback(() => {
    soundManager.click();
    setDesktopIcons(icons => {
      const sorted = [...icons].sort((a, b) => a.name.localeCompare(b.name));
      return arrangeIconsInGrid(sorted);
    });
  }, [arrangeIconsInGrid]);

  // Sort by type (system first, then folders, then files)
  const sortByType = useCallback(() => {
    soundManager.click();
    const typeOrder = { system: 0, folder: 1, file: 2 };
    setDesktopIcons(icons => {
      const sorted = [...icons].sort((a, b) => {
        const typeA = typeOrder[a.type] ?? 3;
        const typeB = typeOrder[b.type] ?? 3;
        if (typeA !== typeB) return typeA - typeB;
        return a.name.localeCompare(b.name);
      });
      return arrangeIconsInGrid(sorted);
    });
  }, [arrangeIconsInGrid]);

  // Sort by size (largest first)
  const sortBySize = useCallback(() => {
    soundManager.click();
    setDesktopIcons(icons => {
      const sorted = [...icons].sort((a, b) => (b.size || 0) - (a.size || 0));
      return arrangeIconsInGrid(sorted);
    });
  }, [arrangeIconsInGrid]);

  // Toggle auto arrange mode
  const toggleAutoArrange = useCallback(() => {
    soundManager.click();
    setAutoArrange(prev => {
      const newState = !prev;
      if (newState) {
        // Re-arrange icons when auto-arrange is enabled
        setDesktopIcons(icons => arrangeIconsInGrid(icons));
      }
      return newState;
    });
  }, [arrangeIconsInGrid]);

  // Line up icons to nearest grid positions
  const lineUpIcons = useCallback(() => {
    soundManager.click();
    setDesktopIcons(icons => icons.map(icon => {
      const nearestCol = Math.round((icon.position.x - GRID_PADDING) / GRID_SPACING_X);
      const nearestRow = Math.round((icon.position.y - GRID_PADDING) / GRID_SPACING_Y);
      return {
        ...icon,
        position: {
          x: Math.max(GRID_PADDING, GRID_PADDING + nearestCol * GRID_SPACING_X),
          y: Math.max(GRID_PADDING, GRID_PADDING + nearestRow * GRID_SPACING_Y)
        }
      };
    }));
  }, []);

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
          { id: 'by-name', label: 'by Name', action: sortByName },
          { id: 'by-type', label: 'by Type', action: sortByType },
          { id: 'by-size', label: 'by Size', action: sortBySize },
          { separator: true },
          { id: 'auto-arrange', label: `${autoArrange ? '✓ ' : ''}Auto Arrange`, action: toggleAutoArrange }
        ]
      },
      {
        id: 'line-up',
        label: 'Line up Icons',
        action: lineUpIcons
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

    if (icon.id === 'computer') {
      // My Computer - Explorer 루트에서 열기
      soundManager.windowOpen();
      onOpenWindow(
        'explorer-computer-' + Date.now(),
        icon.name,
        <Explorer
          initialPath="C:"
          onOpenFile={handleOpenFile}
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
          showInput={showInput}
        />,
        { width: 750, height: 500 }
      );
    } else if (icon.id === 'documents') {
      // My Documents - 문서 폴더에서 열기
      soundManager.windowOpen();
      onOpenWindow(
        'explorer-documents-' + Date.now(),
        icon.name,
        <Explorer
          initialPath="C:\\My Documents"
          onOpenFile={handleOpenFile}
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
          showInput={showInput}
        />,
        { width: 750, height: 500 }
      );
    } else if (icon.id === 'projects') {
      // Projects 애플리케이션 열기
      soundManager.windowOpen();
      onOpenWindow(
        icon.id,
        icon.name,
        <Projects
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
        />,
        { width: 800, height: 600 }
      );
    } else if (icon.id === 'internet') {
      // Internet Explorer 열기
      soundManager.windowOpen();
      onOpenWindow(
        icon.id,
        'Internet Explorer',
        <Browser
          showMessageBox={showMessageBox}
        />,
        { width: 900, height: 650 }
      );
    } else if (icon.id === 'blog') {
      // Blog 애플리케이션 열기
      soundManager.windowOpen();
      onOpenWindow(
        icon.id,
        icon.name,
        <Blog
          showMessageBox={showMessageBox}
          showConfirm={showConfirm}
        />,
        { width: 800, height: 600 }
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
    // If auto-arrange is enabled, snap to grid after drag
    if (autoArrange) {
      setDesktopIcons(icons => {
        const updated = icons.map(icon =>
          icon.id === iconId
            ? {
                ...icon,
                position: {
                  x: Math.max(0, icon.position.x + deltaX),
                  y: Math.max(0, icon.position.y + deltaY)
                }
              }
            : icon
        );
        return arrangeIconsInGrid(updated);
      });
    } else {
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
    }
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
