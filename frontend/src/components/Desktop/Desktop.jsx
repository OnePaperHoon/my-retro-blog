import { useState, useCallback, useEffect, useRef } from 'react';
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

// localStorage key
const DESKTOP_ICONS_KEY = 'desktop_icons';
const DESKTOP_SETTINGS_KEY = 'desktop_settings';

// 기본 아이콘 데이터
const DEFAULT_ICONS = [
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
];

// localStorage에서 아이콘 로드
const loadIconsFromStorage = () => {
  try {
    const saved = localStorage.getItem(DESKTOP_ICONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load desktop icons:', e);
  }
  return DEFAULT_ICONS;
};

// localStorage에서 설정 로드
const loadSettingsFromStorage = () => {
  try {
    const saved = localStorage.getItem(DESKTOP_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load desktop settings:', e);
  }
  return { autoArrange: false };
};

const Desktop = ({ onOpenWindow, showMessageBox, showConfirm, showInput }) => {
  const [selectedIcons, setSelectedIcons] = useState(new Set());
  const [autoArrange, setAutoArrange] = useState(() => loadSettingsFromStorage().autoArrange);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // 클립보드 상태 (Cut/Copy)
  const [clipboard, setClipboard] = useState({ icons: [], mode: null }); // mode: 'cut' | 'copy'

  // 선택 영역 (드래그 선택)
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStart = useRef(null);
  const desktopRef = useRef(null);

  const [desktopIcons, setDesktopIcons] = useState(() => loadIconsFromStorage());

  // 아이콘 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(DESKTOP_ICONS_KEY, JSON.stringify(desktopIcons));
  }, [desktopIcons]);

  // 키보드 단축키 (Ctrl+X, Ctrl+C, Ctrl+V, Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 입력 필드에서는 무시
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey && e.key === 'x' && selectedIcons.size > 0) {
        e.preventDefault();
        handleCutIcons(selectedIcons);
      } else if (e.ctrlKey && e.key === 'c' && selectedIcons.size > 0) {
        e.preventDefault();
        handleCopyIcons(selectedIcons);
      } else if (e.ctrlKey && e.key === 'v' && clipboard.icons.length > 0) {
        e.preventDefault();
        handlePaste();
      } else if (e.key === 'Delete' && selectedIcons.size > 0) {
        e.preventDefault();
        handleDeleteIcons(selectedIcons);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcons, clipboard]);

  // 설정 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(DESKTOP_SETTINGS_KEY, JSON.stringify({ autoArrange }));
  }, [autoArrange]);

  // 단일 선택 (하위 호환성)
  const selectedIcon = selectedIcons.size === 1 ? [...selectedIcons][0] : null;

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

  // 드래그 선택 시작
  const handleMouseDown = (e) => {
    // 아이콘이 아닌 바탕화면 클릭 시에만 선택 영역 시작
    if (e.target === desktopRef.current || e.target.classList.contains('desktop-area')) {
      const rect = desktopRef.current.getBoundingClientRect();
      selectionStart.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setIsSelecting(true);
      if (!e.ctrlKey) {
        setSelectedIcons(new Set());
      }
    }
  };

  // 드래그 선택 중
  const handleMouseMove = (e) => {
    if (!isSelecting || !selectionStart.current) return;

    const rect = desktopRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const box = {
      left: Math.min(selectionStart.current.x, currentX),
      top: Math.min(selectionStart.current.y, currentY),
      width: Math.abs(currentX - selectionStart.current.x),
      height: Math.abs(currentY - selectionStart.current.y)
    };
    setSelectionBox(box);

    // 선택 영역 내 아이콘 선택
    const newSelected = new Set();
    desktopIcons.forEach(icon => {
      const iconCenterX = icon.position.x + 32;
      const iconCenterY = icon.position.y + 40;
      if (
        iconCenterX >= box.left &&
        iconCenterX <= box.left + box.width &&
        iconCenterY >= box.top &&
        iconCenterY <= box.top + box.height
      ) {
        newSelected.add(icon.id);
      }
    });
    setSelectedIcons(newSelected);
  };

  // 드래그 선택 종료
  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionBox(null);
    selectionStart.current = null;
  };

  const handleDesktopClick = (e) => {
    // 아이콘 클릭이 아니면 선택 해제
    if (e.target === desktopRef.current || e.target.classList.contains('desktop-area')) {
      if (!e.ctrlKey) {
        setSelectedIcons(new Set());
      }
    }
    hideContextMenu();
  };

  // 새 폴더 만들기 (실제 구현)
  const handleNewFolder = async () => {
    if (!showInput) return;

    const folderName = await showInput('Enter folder name:', {
      title: 'New Folder',
      placeholder: 'New Folder',
      defaultValue: 'New Folder'
    });

    if (folderName) {
      // 중복 이름 체크
      let finalName = folderName;
      let counter = 1;
      while (desktopIcons.some(icon => icon.name === finalName)) {
        finalName = `${folderName} (${counter})`;
        counter++;
      }

      // 새 위치 계산
      const newPosition = getGridPosition(desktopIcons.length);

      const newFolder = {
        id: `folder-${Date.now()}`,
        name: finalName,
        iconUrl: 'https://win98icons.alexmeub.com/icons/png/directory_closed-4.png',
        content: '',
        type: 'folder',
        size: 0,
        position: autoArrange ? newPosition : { x: 100, y: 100 }
      };

      setDesktopIcons(icons => [...icons, newFolder]);
      soundManager.click();
    }
  };

  // 아이콘 삭제 (실제 구현)
  const handleDeleteIcons = async (iconIds) => {
    const iconsToDelete = desktopIcons.filter(i => iconIds.has(i.id));
    const systemIcons = iconsToDelete.filter(i => i.type === 'system');

    if (systemIcons.length > 0) {
      showMessageBox('Cannot delete system icons (My Computer, Recycle Bin).', 'warning', 'Cannot Delete');
      return;
    }

    const names = iconsToDelete.map(i => i.name).join(', ');
    const confirmed = await showConfirm(
      `Are you sure you want to delete ${iconsToDelete.length > 1 ? 'these items' : `"${names}"`}?`,
      { title: 'Confirm Delete', type: 'question', buttonType: 'yesno' }
    );

    if (confirmed) {
      setDesktopIcons(icons => icons.filter(i => !iconIds.has(i.id)));
      setSelectedIcons(new Set());
      soundManager.click();
    }
  };

  // 아이콘 이름 변경 (실제 구현)
  const handleRenameIcon = async (iconId) => {
    const icon = desktopIcons.find(i => i.id === iconId);
    if (!icon) return;

    if (icon.type === 'system') {
      showMessageBox('Cannot rename system icons.', 'warning', 'Cannot Rename');
      return;
    }

    const newName = await showInput('Enter new name:', {
      title: 'Rename',
      defaultValue: icon.name
    });

    if (newName && newName !== icon.name) {
      // 중복 이름 체크
      if (desktopIcons.some(i => i.id !== iconId && i.name === newName)) {
        showMessageBox('An icon with this name already exists.', 'warning', 'Rename');
        return;
      }

      setDesktopIcons(icons =>
        icons.map(i => i.id === iconId ? { ...i, name: newName } : i)
      );
      soundManager.click();
    }
  };

  const handleRefresh = () => {
    // 아이콘 위치 재정렬 (auto arrange가 켜져 있으면)
    if (autoArrange) {
      setDesktopIcons(icons => arrangeIconsInGrid(icons));
    }
    soundManager.click();
  };

  // Cut 아이콘 (클립보드에 저장)
  const handleCutIcons = (iconIds) => {
    const iconsToCut = desktopIcons.filter(i => iconIds.has(i.id) && i.type !== 'system');
    if (iconsToCut.length > 0) {
      setClipboard({ icons: iconsToCut, mode: 'cut' });
      soundManager.click();
    }
  };

  // Copy 아이콘 (클립보드에 저장)
  const handleCopyIcons = (iconIds) => {
    const iconsToCopy = desktopIcons.filter(i => iconIds.has(i.id) && i.type !== 'system');
    if (iconsToCopy.length > 0) {
      setClipboard({ icons: iconsToCopy, mode: 'copy' });
      soundManager.click();
    }
  };

  // Paste 아이콘 (클립보드에서 붙여넣기)
  const handlePaste = () => {
    if (clipboard.icons.length === 0) return;

    const newIcons = clipboard.icons.map((icon, index) => {
      // 새 위치 계산
      const basePosition = getGridPosition(desktopIcons.length + index);

      // 이름 중복 체크
      let finalName = icon.name;
      if (clipboard.mode === 'copy') {
        let counter = 1;
        while (desktopIcons.some(i => i.name === finalName)) {
          finalName = `${icon.name} - Copy${counter > 1 ? ` (${counter})` : ''}`;
          counter++;
        }
      }

      return {
        ...icon,
        id: `${icon.id}-${Date.now()}-${index}`,
        name: finalName,
        position: autoArrange ? basePosition : { x: basePosition.x + 20, y: basePosition.y + 20 }
      };
    });

    if (clipboard.mode === 'cut') {
      // Cut 모드: 원본 삭제
      const cutIds = new Set(clipboard.icons.map(i => i.id));
      setDesktopIcons(icons => [
        ...icons.filter(i => !cutIds.has(i.id)),
        ...newIcons
      ]);
      setClipboard({ icons: [], mode: null }); // 클립보드 비우기
    } else {
      // Copy 모드: 원본 유지
      setDesktopIcons(icons => [...icons, ...newIcons]);
    }

    soundManager.click();
  };

  // Paste Shortcut (바로가기 붙여넣기)
  const handlePasteShortcut = () => {
    if (clipboard.icons.length === 0) return;

    const newShortcuts = clipboard.icons.map((icon, index) => {
      const basePosition = getGridPosition(desktopIcons.length + index);

      // 바로가기 이름
      let shortcutName = `Shortcut to ${icon.name}`;
      let counter = 1;
      while (desktopIcons.some(i => i.name === shortcutName)) {
        shortcutName = `Shortcut to ${icon.name} (${counter})`;
        counter++;
      }

      return {
        ...icon,
        id: `shortcut-${icon.id}-${Date.now()}-${index}`,
        name: shortcutName,
        iconUrl: icon.iconUrl, // 같은 아이콘 사용 (실제로는 바로가기 오버레이 추가)
        type: 'shortcut',
        targetId: icon.id, // 원본 아이콘 참조
        position: autoArrange ? basePosition : { x: basePosition.x + 20, y: basePosition.y + 20 }
      };
    });

    setDesktopIcons(icons => [...icons, ...newShortcuts]);
    soundManager.click();
  };

  // Properties 다이얼로그 열기
  const handleShowProperties = (icon) => {
    const iconData = desktopIcons.find(i => i.id === icon.id) || icon;
    const createdDate = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    onOpenWindow(
      `properties-${icon.id}-${Date.now()}`,
      `${iconData.name} Properties`,
      <div style={{
        fontFamily: 'MS Sans Serif, sans-serif',
        fontSize: '11px',
        padding: '0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 탭 (General) */}
        <div style={{
          padding: '10px 10px 0 10px'
        }}>
          <div style={{
            border: '1px solid #808080',
            borderBottom: 'none',
            backgroundColor: '#c0c0c0',
            padding: '4px 12px',
            display: 'inline-block',
            marginBottom: '-1px',
            position: 'relative',
            zIndex: 1
          }}>
            General
          </div>
        </div>

        {/* 탭 내용 */}
        <div style={{
          flex: 1,
          margin: '0 10px',
          padding: '20px',
          border: '2px groove #c0c0c0',
          backgroundColor: '#c0c0c0'
        }}>
          {/* 아이콘 및 이름 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <img
              src={iconData.iconUrl}
              alt={iconData.name}
              style={{ width: 32, height: 32, marginRight: 10 }}
            />
            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{iconData.name}</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #808080', margin: '10px 0' }} />

          {/* 정보 테이블 */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#000' }}>Type:</td>
                <td style={{ padding: '4px 0' }}>
                  {iconData.type === 'system' ? 'System Folder' :
                   iconData.type === 'folder' ? 'File Folder' :
                   iconData.type === 'shortcut' ? 'Shortcut' :
                   iconData.type === 'app' ? 'Application' : 'File'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#000' }}>Location:</td>
                <td style={{ padding: '4px 0' }}>Desktop</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#000' }}>Size:</td>
                <td style={{ padding: '4px 0' }}>{iconData.size || 0} bytes</td>
              </tr>
            </tbody>
          </table>

          <hr style={{ border: 'none', borderTop: '1px solid #808080', margin: '10px 0' }} />

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#000' }}>Created:</td>
                <td style={{ padding: '4px 0' }}>{createdDate}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#000' }}>Modified:</td>
                <td style={{ padding: '4px 0' }}>{createdDate}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#000' }}>Accessed:</td>
                <td style={{ padding: '4px 0' }}>{createdDate}</td>
              </tr>
            </tbody>
          </table>

          <hr style={{ border: 'none', borderTop: '1px solid #808080', margin: '10px 0' }} />

          {/* Attributes */}
          <div style={{ marginTop: '10px' }}>
            <span style={{ marginRight: '20px' }}>Attributes:</span>
            <label style={{ marginRight: '15px' }}>
              <input type="checkbox" disabled checked={iconData.type === 'system'} /> Read-only
            </label>
            <label>
              <input type="checkbox" disabled /> Hidden
            </label>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div style={{
          padding: '10px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '6px'
        }}>
          <button
            onClick={() => {/* close window */}}
            style={{
              padding: '4px 20px',
              minWidth: '75px',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
          <button
            style={{
              padding: '4px 20px',
              minWidth: '75px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            style={{
              padding: '4px 20px',
              minWidth: '75px',
              cursor: 'pointer'
            }}
          >
            Apply
          </button>
        </div>
      </div>,
      { width: 350, height: 420 }
    );
  };

  // 바탕화면 Properties (디스플레이 설정)
  const handleDesktopProperties = () => {
    showMessageBox(
      'Display Properties\n\nTo change display settings, please use Control Panel > Display.',
      'info',
      'Display Properties'
    );
  };

  const handleDesktopContextMenu = (e) => {

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
        disabled: clipboard.icons.length === 0,
        action: handlePaste
      },
      {
        id: 'paste-shortcut',
        label: 'Paste Shortcut',
        disabled: clipboard.icons.length === 0,
        action: handlePasteShortcut
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
        action: handleDesktopProperties
      }
    ];

    showContextMenu(e, menuItems);
  };

  // 아이콘 선택 (Ctrl+클릭으로 다중 선택)
  const handleIconSelect = (iconId, event) => {
    if (event?.ctrlKey) {
      // Ctrl+클릭: 다중 선택 토글
      setSelectedIcons(prev => {
        const newSet = new Set(prev);
        if (newSet.has(iconId)) {
          newSet.delete(iconId);
        } else {
          newSet.add(iconId);
        }
        return newSet;
      });
    } else {
      // 일반 클릭: 단일 선택
      setSelectedIcons(new Set([iconId]));
    }
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
    } else if (icon.id === 'trash') {
      // Recycle Bin
      soundManager.windowOpen();
      showMessageBox('Recycle Bin is empty.', 'info', 'Recycle Bin');
    } else if (icon.type === 'folder') {
      // 사용자가 만든 폴더 - Explorer로 열기
      soundManager.windowOpen();
      onOpenWindow(
        `explorer-${icon.id}-${Date.now()}`,
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
    } else {
      // 기타 아이콘
      soundManager.windowOpen();
      onOpenWindow(icon.id, icon.name, <div style={{ padding: '20px' }}>{icon.content || `${icon.name}`}</div>);
    }
  };

  const handleIconContextMenu = (e, icon) => {
    e.preventDefault();
    e.stopPropagation();

    // 선택되지 않은 아이콘 우클릭 시 해당 아이콘만 선택
    if (!selectedIcons.has(icon.id)) {
      setSelectedIcons(new Set([icon.id]));
    }

    const isSystemIcon = icon.type === 'system';
    const currentSelection = selectedIcons.has(icon.id) ? selectedIcons : new Set([icon.id]);

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
        disabled: isSystemIcon,
        action: () => handleCutIcons(currentSelection)
      },
      {
        id: 'copy',
        label: 'Copy',
        disabled: isSystemIcon,
        action: () => handleCopyIcons(currentSelection)
      },
      {
        id: 'paste',
        label: 'Paste',
        disabled: clipboard.icons.length === 0,
        action: handlePaste
      },
      { separator: true },
      {
        id: 'delete',
        label: 'Delete',
        disabled: isSystemIcon,
        action: () => handleDeleteIcons(currentSelection)
      },
      {
        id: 'rename',
        label: 'Rename',
        disabled: isSystemIcon || currentSelection.size > 1,
        action: () => handleRenameIcon(icon.id)
      },
      { separator: true },
      {
        id: 'properties',
        label: 'Properties',
        action: () => handleShowProperties(icon)
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
        ref={desktopRef}
        className="desktop-area"
        onClick={handleDesktopClick}
        onContextMenu={handleDesktopContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: 'calc(100vh - 46px)', // 작업표시줄 높이 제외
          position: 'relative',
          userSelect: 'none'
        }}
      >
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            name={icon.name}
            iconUrl={icon.iconUrl}
            position={icon.position}
            selected={selectedIcons.has(icon.id)}
            onSelect={(e) => handleIconSelect(icon.id, e)}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            onContextMenu={(e) => handleIconContextMenu(e, icon)}
            onDrag={(deltaX, deltaY) => handleIconDrag(icon.id, deltaX, deltaY)}
          />
        ))}

        {/* 드래그 선택 영역 */}
        {selectionBox && (
          <div
            style={{
              position: 'absolute',
              left: selectionBox.left,
              top: selectionBox.top,
              width: selectionBox.width,
              height: selectionBox.height,
              border: '1px dashed #000080',
              backgroundColor: 'rgba(0, 0, 128, 0.1)',
              pointerEvents: 'none'
            }}
          />
        )}
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
