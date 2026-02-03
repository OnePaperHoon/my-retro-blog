import { useState, useEffect, useCallback } from 'react';
import { WindowContent, MenuList, MenuListItem, Separator } from 'react95';
import FolderTree from './FolderTree';
import FileList from './FileList';
import Toolbar from './Toolbar';
import AddressBar from './AddressBar';
import { fileSystem as localFileSystem, findNodeByPath as localFindNodeByPath, findNodeById } from '../../data/fileSystem';
import { filesAPI, postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import soundManager from '../../utils/sounds';

// localStorage keys
const FAVORITES_KEY = 'explorer_favorites';

// API 데이터를 로컬 형식으로 변환
const convertApiToLocal = (apiFiles, parentPath = 'C:') => {
  return apiFiles.map(file => ({
    id: file._id,
    name: file.name,
    type: file.type,
    path: `${parentPath}\\${file.name}`,
    icon: file.icon || (file.type === 'folder' ? '📁' : '📄'),
    size: file.size ? `${file.size} B` : undefined,
    modified: file.updatedAt ? new Date(file.updatedAt).toLocaleDateString() : undefined,
    content: file.content,
    children: file.children ? convertApiToLocal(file.children, `${parentPath}\\${file.name}`) : undefined
  }));
};

// 블로그 포스트를 파일 시스템 형식으로 변환
const convertPostsToFiles = (posts, parentPath = 'C:\\Blog Posts') => {
  return posts.map(post => ({
    id: `post-${post._id}`,
    name: `${post.title}.txt`,
    type: 'file',
    path: `${parentPath}\\${post.title}.txt`,
    icon: '📝',
    size: post.content ? `${post.content.length} B` : '0 B',
    modified: post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : undefined,
    content: `Title: ${post.title}\nCategory: ${post.category || 'General'}\nCreated: ${new Date(post.createdAt).toLocaleDateString()}\nViews: ${post.views || 0}\n${post.tags?.length ? `Tags: ${post.tags.join(', ')}\n` : ''}\n---\n\n${post.content || ''}`
  }));
};

// Desktop 아이콘을 파일 시스템 형식으로 변환
const getDesktopItems = () => {
  try {
    const saved = localStorage.getItem('desktop_icons');
    if (saved) {
      const icons = JSON.parse(saved);
      // 사용자가 만든 폴더/파일만 포함 (system 타입 제외)
      return icons
        .filter(icon => icon.type === 'folder' || icon.type === 'file')
        .map(icon => ({
          id: `desktop-${icon.id}`,
          name: icon.name,
          type: icon.type,
          path: `C:\\Desktop\\${icon.name}`,
          icon: icon.type === 'folder' ? '📁' : '📄',
          size: icon.size ? `${icon.size} B` : undefined,
          content: icon.content || '',
          children: icon.type === 'folder' ? [] : undefined
        }));
    }
  } catch (e) {
    console.error('Failed to load desktop items:', e);
  }
  return [];
};

// 로컬 데이터와 API 데이터를 병합
const mergeFileSystem = (local, apiData, blogPosts = []) => {
  const additionalFolders = [];

  // Desktop 폴더에 바탕화면 아이콘 추가
  const desktopItems = getDesktopItems();

  // API 데이터가 있으면 Server Files 폴더 추가
  if (apiData && apiData.length > 0) {
    additionalFolders.push({
      id: 'api-files',
      name: 'Server Files',
      type: 'folder',
      path: 'C:\\Server Files',
      icon: '🌐',
      children: convertApiToLocal(apiData, 'C:\\Server Files')
    });
  }

  // 블로그 포스트가 있으면 Blog Posts 폴더 추가
  if (blogPosts && blogPosts.length > 0) {
    // 카테고리별로 그룹화
    const postsByCategory = {};
    blogPosts.forEach(post => {
      const category = post.category || 'General';
      if (!postsByCategory[category]) {
        postsByCategory[category] = [];
      }
      postsByCategory[category].push(post);
    });

    const categoryFolders = Object.entries(postsByCategory).map(([category, posts]) => ({
      id: `blog-category-${category}`,
      name: category,
      type: 'folder',
      path: `C:\\Blog Posts\\${category}`,
      icon: '📂',
      children: convertPostsToFiles(posts, `C:\\Blog Posts\\${category}`)
    }));

    additionalFolders.push({
      id: 'blog-posts',
      name: 'Blog Posts',
      type: 'folder',
      path: 'C:\\Blog Posts',
      icon: '📰',
      children: categoryFolders
    });
  }

  // Desktop 폴더 업데이트
  const updatedLocal = {
    ...local,
    children: local.children?.map(child => {
      if (child.id === 'desktop') {
        return {
          ...child,
          children: desktopItems
        };
      }
      return child;
    }) || []
  };

  if (additionalFolders.length === 0) return updatedLocal;

  return {
    ...updatedLocal,
    children: [...additionalFolders, ...(updatedLocal.children || [])]
  };
};

const Explorer = ({ onOpenFile, showMessageBox, showConfirm, showInput, initialPath = 'C:\\My Documents\\Projects' }) => {
  const [fileSystem, setFileSystem] = useState(localFileSystem);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState('details');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const { isAuthenticated } = useAuth();

  // 경로로 노드 찾기 (병합된 파일시스템에서)
  const findNodeByPath = (path, node = fileSystem) => {
    if (!node) return null;
    if (node.path === path) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByPath(path, child);
        if (found) return found;
      }
    }
    return null;
  };

  // API에서 파일 데이터 로드
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      try {
        // 파일과 블로그 포스트를 병렬로 로드
        const [filesResponse, postsResponse] = await Promise.all([
          filesAPI.getTree().catch(() => ({ success: false, data: [] })),
          postsAPI.getAll({ limit: 100 }).catch(() => ({ success: false, data: [] }))
        ]);

        const apiFiles = filesResponse.success ? filesResponse.data : [];
        const blogPosts = postsResponse.success ? postsResponse.data : [];

        const merged = mergeFileSystem(localFileSystem, apiFiles, blogPosts);
        setFileSystem(merged);

        // 초기 노드 설정 - initialPath 사용
        const findNode = (path, node) => {
          if (!node) return null;
          if (node.path === path) return node;
          if (node.children) {
            for (const child of node.children) {
              const found = findNode(path, child);
              if (found) return found;
            }
          }
          return null;
        };
        const initialNode = findNode(initialPath, merged) || merged.children?.[0] || merged;
        setCurrentNode(initialNode);
        setHistory([initialNode.path]);
      } catch (error) {
        console.log('Using local filesystem (API unavailable)');
        const initialNode = localFindNodeByPath(initialPath) || localFileSystem.children?.[0];
        setCurrentNode(initialNode);
        setHistory([initialNode.path]);
      } finally {
        setIsLoading(false);
      }
    };
    loadFiles();
  }, [initialPath]);

  const navigateTo = (node) => {
    if (!node || node.type !== 'folder') return;

    const newHistory = [...history.slice(0, historyIndex + 1), node.path];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentNode(node);
    setSelectedItemId(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const node = findNodeByPath(history[newIndex]);
      if (node) setCurrentNode(node);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const node = findNodeByPath(history[newIndex]);
      if (node) setCurrentNode(node);
    }
  };

  const handleUp = () => {
    const pathParts = currentNode.path.split('\\');
    if (pathParts.length > 1) {
      pathParts.pop();
      const parentPath = pathParts.join('\\');
      const parentNode = findNodeByPath(parentPath);
      if (parentNode) {
        navigateTo(parentNode);
      }
    }
  };

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      navigateTo(item);
    } else {
      // 파일 열기
      if (onOpenFile) {
        onOpenFile(item);
      }
    }
  };

  const handleItemClick = (item) => {
    setSelectedItemId(item.id);
  };

  const items = currentNode?.children || [];

  // MongoDB ObjectId 형식인지 확인
  const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

  // 파일 목록 새로고침 함수
  const refreshFileList = async () => {
    const [treeResponse, postsResponse] = await Promise.all([
      filesAPI.getTree().catch(() => ({ success: false, data: [] })),
      postsAPI.getAll({ limit: 100 }).catch(() => ({ success: false, data: [] }))
    ]);
    const apiFiles = treeResponse.success ? treeResponse.data : [];
    const blogPosts = postsResponse.success ? postsResponse.data : [];
    const merged = mergeFileSystem(localFileSystem, apiFiles, blogPosts);
    setFileSystem(merged);
    // 현재 노드 업데이트
    const updatedNode = findNodeByPath(currentNode.path, merged);
    if (updatedNode) {
      setCurrentNode(updatedNode);
    }
  };

  // 폴더 생성
  const handleCreateFolder = async () => {
    if (!showInput) return;

    const folderName = await showInput('Enter folder name:', {
      title: 'New Folder',
      placeholder: 'New Folder'
    });

    if (folderName) {
      if (!isAuthenticated) {
        showMessageBox('You must be logged in as administrator to create folders.', 'warning', 'Access Denied');
        return;
      }

      try {
        const parentId = currentNode?.id && isMongoId(currentNode.id) ? currentNode.id : null;

        const response = await filesAPI.create({
          name: folderName,
          type: 'folder',
          parentId: parentId
        });

        if (response.success) {
          showMessageBox(`Folder "${folderName}" created successfully!`, 'info', 'Success');
          await refreshFileList();
        }
      } catch (error) {
        showMessageBox(`Failed to create folder: ${error.message}`, 'error', 'Error');
      }
    }
  };

  // 파일 생성
  const handleCreateFile = async () => {
    if (!showInput) return;

    const fileName = await showInput('Enter file name:', {
      title: 'New Text File',
      placeholder: 'New File.txt'
    });

    if (fileName) {
      if (!isAuthenticated) {
        showMessageBox('You must be logged in as administrator to create files.', 'warning', 'Access Denied');
        return;
      }

      try {
        const parentId = currentNode?.id && isMongoId(currentNode.id) ? currentNode.id : null;

        // 확장자가 없으면 .txt 추가
        const finalName = fileName.includes('.') ? fileName : `${fileName}.txt`;

        const response = await filesAPI.create({
          name: finalName,
          type: 'file',
          content: '',
          parentId: parentId
        });

        if (response.success) {
          showMessageBox(`File "${finalName}" created successfully!`, 'info', 'Success');
          await refreshFileList();
        }
      } catch (error) {
        showMessageBox(`Failed to create file: ${error.message}`, 'error', 'Error');
      }
    }
  };

  // 메뉴 상태
  const [activeMenu, setActiveMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null); // { action: 'cut'|'copy', item: {...} }
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [sortBy, setSortBy] = useState('name'); // name, size, type, date

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // 클립보드 작업
  const handleCut = useCallback(() => {
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        setClipboard({ action: 'cut', item });
        soundManager.click();
      }
    }
    setActiveMenu(null);
  }, [selectedItemId, items]);

  const handleCopy = useCallback(() => {
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        setClipboard({ action: 'copy', item });
        soundManager.click();
      }
    }
    setActiveMenu(null);
  }, [selectedItemId, items]);

  const handlePaste = useCallback(async () => {
    if (!clipboard) return;
    setActiveMenu(null);

    if (!isAuthenticated) {
      showMessageBox('You must be logged in as administrator to paste files.', 'warning', 'Access Denied');
      return;
    }

    if (!isMongoId(clipboard.item.id)) {
      showMessageBox('This item cannot be pasted (local file).', 'warning', 'Cannot Paste');
      return;
    }

    try {
      if (clipboard.action === 'cut') {
        // Move operation
        const targetId = currentNode?.id && isMongoId(currentNode.id) ? currentNode.id : null;
        if (targetId) {
          const response = await filesAPI.move(clipboard.item.id, targetId);
          if (response.success) {
            showMessageBox(`"${clipboard.item.name}" has been moved.`, 'info', 'Success');
            setClipboard(null);
            await refreshFileList();
          }
        } else {
          showMessageBox('Cannot paste to this folder (local folder).', 'warning', 'Cannot Paste');
        }
      } else {
        // Copy operation - create new file with same content
        const parentId = currentNode?.id && isMongoId(currentNode.id) ? currentNode.id : null;
        const response = await filesAPI.create({
          name: `Copy of ${clipboard.item.name}`,
          type: clipboard.item.type,
          content: clipboard.item.content || '',
          parentId: parentId
        });
        if (response.success) {
          showMessageBox(`"${clipboard.item.name}" has been copied.`, 'info', 'Success');
          await refreshFileList();
        }
      }
    } catch (error) {
      showMessageBox(`Failed to paste: ${error.message}`, 'error', 'Error');
    }
  }, [clipboard, currentNode, isAuthenticated, showMessageBox]);

  const handleSelectAll = useCallback(() => {
    // Select all items (simplified - just select first item for now)
    if (items.length > 0) {
      setSelectedItemId(items[0].id);
    }
    setActiveMenu(null);
    soundManager.click();
  }, [items]);

  const handleDelete = useCallback(() => {
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        handleDeleteItem(item);
      }
    }
    setActiveMenu(null);
  }, [selectedItemId, items]);

  // 파일 이름 변경
  const handleRename = useCallback(async () => {
    setActiveMenu(null);
    if (!selectedItemId) return;

    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    if (!isAuthenticated) {
      showMessageBox('You must be logged in as administrator to rename files.', 'warning', 'Access Denied');
      return;
    }

    if (!isMongoId(item.id)) {
      showMessageBox('This item cannot be renamed (local file).', 'warning', 'Cannot Rename');
      return;
    }

    const newName = await showInput(`Enter new name for "${item.name}":`, {
      title: 'Rename',
      placeholder: item.name
    });

    if (newName && newName !== item.name) {
      try {
        const response = await filesAPI.update(item.id, { name: newName });
        if (response.success) {
          showMessageBox(`Renamed to "${newName}".`, 'info', 'Success');
          await refreshFileList();
        }
      } catch (error) {
        showMessageBox(`Failed to rename: ${error.message}`, 'error', 'Error');
      }
    }
  }, [selectedItemId, items, isAuthenticated, showInput, showMessageBox]);

  // 검색 기능
  const searchInFileSystem = useCallback((query, node = fileSystem, results = []) => {
    if (!query || !node) return results;

    if (node.name && node.name.toLowerCase().includes(query.toLowerCase())) {
      results.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        searchInFileSystem(query, child, results);
      }
    }

    return results;
  }, [fileSystem]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = searchInFileSystem(searchQuery.trim());
    setSearchResults(results);
    soundManager.click();
  }, [searchQuery, searchInFileSystem]);

  const handleSearchItemClick = (item) => {
    if (item.type === 'folder') {
      navigateTo(item);
    } else {
      // Navigate to parent folder and select the file
      const pathParts = item.path.split('\\');
      pathParts.pop();
      const parentPath = pathParts.join('\\');
      const parentNode = findNodeByPath(parentPath);
      if (parentNode) {
        navigateTo(parentNode);
        setSelectedItemId(item.id);
      }
    }
    setShowSearchDialog(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 정렬 기능
  const sortedItems = [...items].sort((a, b) => {
    // Folders first
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;

    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        const sizeA = parseInt(a.size) || 0;
        const sizeB = parseInt(b.size) || 0;
        return sizeA - sizeB;
      case 'type':
        const extA = a.name.split('.').pop() || '';
        const extB = b.name.split('.').pop() || '';
        return extA.localeCompare(extB);
      case 'date':
        return (a.modified || '').localeCompare(b.modified || '');
      default:
        return 0;
    }
  });

  // Favorites 관리
  const addToFavorites = useCallback(() => {
    if (!currentNode) return;
    const exists = favorites.some(f => f.path === currentNode.path);
    if (!exists) {
      setFavorites([...favorites, { name: currentNode.name, path: currentNode.path, icon: currentNode.icon || '📁' }]);
      showMessageBox(`"${currentNode.name}" added to Favorites.`, 'info', 'Favorites');
    } else {
      showMessageBox('This folder is already in Favorites.', 'info', 'Favorites');
    }
    setActiveMenu(null);
    soundManager.click();
  }, [currentNode, favorites, showMessageBox]);

  const removeFromFavorites = useCallback((path) => {
    setFavorites(favorites.filter(f => f.path !== path));
    soundManager.click();
  }, [favorites]);

  const navigateToFavorite = useCallback((fav) => {
    const node = findNodeByPath(fav.path);
    if (node) {
      navigateTo(node);
    } else {
      showMessageBox('This folder no longer exists.', 'warning', 'Not Found');
    }
    setActiveMenu(null);
  }, [findNodeByPath, navigateTo, showMessageBox]);

  // Go 메뉴 네비게이션
  const goToDesktop = useCallback(() => {
    const node = findNodeByPath('C:\\Desktop');
    if (node) navigateTo(node);
    setActiveMenu(null);
  }, [findNodeByPath, navigateTo]);

  const goToMyDocuments = useCallback(() => {
    const node = findNodeByPath('C:\\My Documents');
    if (node) navigateTo(node);
    setActiveMenu(null);
  }, [findNodeByPath, navigateTo]);

  const goToMyComputer = useCallback(() => {
    setCurrentNode(fileSystem);
    setActiveMenu(null);
  }, [fileSystem]);

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menu) => {
    soundManager.click();
    if (activeMenu === menu) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menu);
    }
  };

  // 메뉴 아이템 스타일
  const menuItemStyle = {
    padding: '4px 20px',
    cursor: 'pointer',
    color: '#000',
    fontSize: '12px',
    whiteSpace: 'nowrap'
  };

  const menuItemHoverProps = {
    onMouseEnter: (e) => { e.target.style.backgroundColor = '#000080'; e.target.style.color = '#fff'; },
    onMouseLeave: (e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#000'; }
  };

  const disabledMenuItemStyle = {
    ...menuItemStyle,
    color: '#808080',
    cursor: 'default'
  };

  const menuSeparatorStyle = {
    height: '1px',
    backgroundColor: '#808080',
    margin: '4px 2px'
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+C - Copy
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
      // Ctrl+X - Cut
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        handleCut();
      }
      // Ctrl+V - Paste
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
      // Ctrl+A - Select All
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      // Ctrl+F - Find
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setShowSearchDialog(true);
      }
      // F5 - Refresh
      if (e.key === 'F5') {
        e.preventDefault();
        refreshFileList();
        soundManager.click();
      }
      // F2 - Rename
      if (e.key === 'F2' && selectedItemId) {
        e.preventDefault();
        handleRename();
      }
      // Delete - Delete
      if (e.key === 'Delete' && selectedItemId) {
        e.preventDefault();
        handleDelete();
      }
      // Backspace - Go Up
      if (e.key === 'Backspace' && !showSearchDialog) {
        e.preventDefault();
        handleUp();
      }
      // Alt+Left - Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
      // Alt+Right - Forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleForward();
      }
      // Escape - Close search dialog or deselect
      if (e.key === 'Escape') {
        if (showSearchDialog) {
          setShowSearchDialog(false);
          setSearchQuery('');
          setSearchResults([]);
        } else {
          setSelectedItemId(null);
          setActiveMenu(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handleCut, handlePaste, handleSelectAll, handleRename, handleDelete, selectedItemId, showSearchDialog, handleUp, handleBack, handleForward]);

  // 파일/폴더 삭제
  const handleDeleteItem = async (item) => {
    if (!isAuthenticated) {
      showMessageBox('You must be logged in as administrator to delete files.', 'warning', 'Access Denied');
      return;
    }

    if (!isMongoId(item.id)) {
      showMessageBox('This item cannot be deleted (local file).', 'warning', 'Cannot Delete');
      return;
    }

    const confirmed = await showConfirm(
      `Are you sure you want to delete "${item.name}"?${item.type === 'folder' ? '\n\nThis will also delete all contents inside.' : ''}`,
      { title: 'Confirm Delete' }
    );

    if (confirmed) {
      try {
        const response = await filesAPI.delete(item.id);
        if (response.success) {
          showMessageBox(`"${item.name}" has been deleted.`, 'info', 'Deleted');
          await refreshFileList();
        }
      } catch (error) {
        showMessageBox(`Failed to delete: ${error.message}`, 'error', 'Error');
      }
    }
  };

  // 파일/폴더 이동 (드래그 앤 드롭)
  const handleMoveItem = async (item, targetFolder) => {
    if (!isAuthenticated) {
      showMessageBox('You must be logged in as administrator to move files.', 'warning', 'Access Denied');
      return;
    }

    // MongoDB ID만 이동 가능 (서버 파일만)
    if (!isMongoId(item.id)) {
      showMessageBox('This item cannot be moved (local file).', 'warning', 'Cannot Move');
      return;
    }

    // 대상 폴더도 MongoDB ID여야 함
    if (!isMongoId(targetFolder.id)) {
      showMessageBox('Cannot move to this folder (local folder).', 'warning', 'Cannot Move');
      return;
    }

    try {
      const response = await filesAPI.move(item.id, targetFolder.id);
      if (response.success) {
        showMessageBox(`"${item.name}" has been moved to "${targetFolder.name}".`, 'info', 'Moved');
        await refreshFileList();
      }
    } catch (error) {
      showMessageBox(`Failed to move: ${error.message}`, 'error', 'Error');
    }
  };

  // 로딩 중이면 로딩 화면 표시
  if (isLoading || !currentNode) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#c0c0c0'
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  // 드롭다운 메뉴 렌더링
  const renderDropdownMenu = (menuName) => {
    const menuStyle = {
      position: 'absolute',
      top: '100%',
      left: 0,
      backgroundColor: '#c0c0c0',
      border: '2px outset #fff',
      boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      minWidth: '180px',
      zIndex: 1000
    };

    switch (menuName) {
      case 'File':
        return (
          <div style={menuStyle}>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setActiveMenu(null); handleCreateFolder(); }}>
              📁 New Folder
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setActiveMenu(null); handleCreateFile(); }}>
              📄 New Text File
            </div>
            <div style={menuSeparatorStyle} />
            <div style={selectedItemId ? menuItemStyle : disabledMenuItemStyle}
              {...(selectedItemId ? menuItemHoverProps : {})}
              onClick={(e) => { e.stopPropagation(); if (selectedItemId) handleRename(); }}>
              Rename
            </div>
            <div style={selectedItemId ? menuItemStyle : disabledMenuItemStyle}
              {...(selectedItemId ? menuItemHoverProps : {})}
              onClick={(e) => { e.stopPropagation(); if (selectedItemId) handleDelete(); }}>
              Delete
            </div>
            <div style={menuSeparatorStyle} />
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}>
              Close
            </div>
          </div>
        );

      case 'Edit':
        return (
          <div style={menuStyle}>
            <div style={selectedItemId ? menuItemStyle : disabledMenuItemStyle}
              {...(selectedItemId ? menuItemHoverProps : {})}
              onClick={(e) => { e.stopPropagation(); handleCut(); }}>
              Cut                  Ctrl+X
            </div>
            <div style={selectedItemId ? menuItemStyle : disabledMenuItemStyle}
              {...(selectedItemId ? menuItemHoverProps : {})}
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
              Copy                 Ctrl+C
            </div>
            <div style={clipboard ? menuItemStyle : disabledMenuItemStyle}
              {...(clipboard ? menuItemHoverProps : {})}
              onClick={(e) => { e.stopPropagation(); handlePaste(); }}>
              Paste                Ctrl+V
            </div>
            <div style={menuSeparatorStyle} />
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); handleSelectAll(); }}>
              Select All           Ctrl+A
            </div>
            <div style={menuSeparatorStyle} />
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setActiveMenu(null); setShowSearchDialog(true); }}>
              Find...              Ctrl+F
            </div>
          </div>
        );

      case 'View':
        return (
          <div style={menuStyle}>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setViewMode('icons'); setActiveMenu(null); soundManager.click(); }}>
              {viewMode === 'icons' ? '✓ ' : '   '}Large Icons
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setViewMode('list'); setActiveMenu(null); soundManager.click(); }}>
              {viewMode === 'list' ? '✓ ' : '   '}List
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setViewMode('details'); setActiveMenu(null); soundManager.click(); }}>
              {viewMode === 'details' ? '✓ ' : '   '}Details
            </div>
            <div style={menuSeparatorStyle} />
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setSortBy('name'); setActiveMenu(null); soundManager.click(); }}>
              {sortBy === 'name' ? '✓ ' : '   '}Sort by Name
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setSortBy('type'); setActiveMenu(null); soundManager.click(); }}>
              {sortBy === 'type' ? '✓ ' : '   '}Sort by Type
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setSortBy('size'); setActiveMenu(null); soundManager.click(); }}>
              {sortBy === 'size' ? '✓ ' : '   '}Sort by Size
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); setSortBy('date'); setActiveMenu(null); soundManager.click(); }}>
              {sortBy === 'date' ? '✓ ' : '   '}Sort by Date
            </div>
            <div style={menuSeparatorStyle} />
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); refreshFileList(); setActiveMenu(null); soundManager.click(); }}>
              Refresh              F5
            </div>
          </div>
        );

      case 'Go':
        return (
          <div style={menuStyle}>
            <div style={historyIndex > 0 ? menuItemStyle : disabledMenuItemStyle}
              {...(historyIndex > 0 ? menuItemHoverProps : {})}
              onClick={(e) => { e.stopPropagation(); if (historyIndex > 0) { handleBack(); setActiveMenu(null); } }}>
              Back                 Alt+←
            </div>
            <div style={historyIndex < history.length - 1 ? menuItemStyle : disabledMenuItemStyle}
              {...(historyIndex < history.length - 1 ? menuItemHoverProps : {})}
              onClick={(e) => { e.stopPropagation(); if (historyIndex < history.length - 1) { handleForward(); setActiveMenu(null); } }}>
              Forward              Alt+→
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); handleUp(); setActiveMenu(null); }}>
              Up One Level
            </div>
            <div style={menuSeparatorStyle} />
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); goToMyComputer(); }}>
              My Computer
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); goToMyDocuments(); }}>
              My Documents
            </div>
          </div>
        );

      case 'Favorites':
        return (
          <div style={menuStyle}>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => { e.stopPropagation(); addToFavorites(); }}>
              Add to Favorites...
            </div>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(null);
                if (favorites.length === 0) {
                  showMessageBox('No favorites to organize.', 'info', 'Favorites');
                } else {
                  showMessageBox('Favorites:\n\n' + favorites.map(f => `• ${f.name}`).join('\n'), 'info', 'Organize Favorites');
                }
              }}>
              Organize Favorites...
            </div>
            {favorites.length > 0 && <div style={menuSeparatorStyle} />}
            {favorites.map((fav, idx) => (
              <div key={idx} style={menuItemStyle} {...menuItemHoverProps}
                onClick={(e) => { e.stopPropagation(); navigateToFavorite(fav); }}>
                {fav.icon} {fav.name}
              </div>
            ))}
          </div>
        );

      case 'Help':
        return (
          <div style={menuStyle}>
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(null);
                showMessageBox(
                  'Windows 98 Explorer\n\nUse this to browse your files and folders.\n\nDouble-click folders to open them.\nDouble-click files to view them.\n\nKeyboard Shortcuts:\n• Ctrl+C - Copy\n• Ctrl+X - Cut\n• Ctrl+V - Paste\n• Ctrl+F - Find\n• F5 - Refresh',
                  'info',
                  'Help'
                );
              }}>
              Help Topics
            </div>
            <div style={menuSeparatorStyle} />
            <div style={menuItemStyle} {...menuItemHoverProps}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(null);
                showMessageBox(
                  'Windows Explorer\n\nVersion 4.72.3110.1\n\n© Microsoft Corporation 1981-1998',
                  'info',
                  'About Windows Explorer'
                );
              }}>
              About Windows Explorer
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => setActiveMenu(null)}>
      {/* 검색 다이얼로그 */}
      {showSearchDialog && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#c0c0c0',
          border: '2px outset #fff',
          padding: '16px',
          zIndex: 2000,
          minWidth: '350px',
          boxShadow: '4px 4px 8px rgba(0,0,0,0.3)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>Find Files</span>
            <button onClick={() => { setShowSearchDialog(false); setSearchQuery(''); setSearchResults([]); }}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}>X</button>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Named:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              style={{ width: '100%', padding: '4px', fontSize: '12px' }}
              placeholder="Enter file name to search..."
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button onClick={handleSearch} style={{ padding: '4px 16px', cursor: 'pointer' }}>Find Now</button>
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ padding: '4px 16px', cursor: 'pointer' }}>Clear</button>
          </div>
          {searchResults.length > 0 && (
            <div style={{
              maxHeight: '200px',
              overflow: 'auto',
              border: '1px inset #808080',
              backgroundColor: '#fff'
            }}>
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSearchItemClick(result)}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    borderBottom: '1px solid #e0e0e0'
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#000080'; e.target.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#000'; }}
                >
                  {result.icon || (result.type === 'folder' ? '📁' : '📄')} {result.name}
                  <span style={{ marginLeft: '8px', opacity: 0.7 }}>{result.path}</span>
                </div>
              ))}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <div style={{ fontSize: '12px', color: '#808080' }}>No results found.</div>
          )}
        </div>
      )}

      {/* 메뉴 바 */}
      <div style={{
        display: 'flex',
        backgroundColor: '#c0c0c0',
        borderBottom: '2px solid #808080',
        position: 'relative'
      }}>
        {['File', 'Edit', 'View', 'Go', 'Favorites', 'Help'].map(menu => (
          <div
            key={menu}
            style={{
              padding: '4px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              userSelect: 'none',
              position: 'relative',
              backgroundColor: activeMenu === menu ? '#000080' : 'transparent',
              color: activeMenu === menu ? '#fff' : '#000'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(menu);
            }}
          >
            {menu}
            {activeMenu === menu && renderDropdownMenu(menu)}
          </div>
        ))}
      </div>

      {/* 툴바 */}
      <Toolbar
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        onBack={handleBack}
        onForward={handleForward}
        onUp={handleUp}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 주소 표시줄 */}
      <AddressBar currentPath={currentNode.path} />

      {/* 메인 콘텐츠 (2패널) */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '4px',
        padding: '4px',
        backgroundColor: '#c0c0c0',
        overflow: 'hidden'
      }}>
        {/* 좌측: 폴더 트리 */}
        <FolderTree
          rootNode={fileSystem}
          selectedPath={currentNode.path}
          onSelectFolder={navigateTo}
        />

        {/* 우측: 파일 목록 */}
        <FileList
          items={sortedItems}
          viewMode={viewMode}
          isAuthenticated={isAuthenticated}
          onDeleteItem={handleDeleteItem}
          onMoveItem={handleMoveItem}
          onItemDoubleClick={handleItemDoubleClick}
          onItemClick={handleItemClick}
          selectedItemId={selectedItemId}
          onRename={handleRename}
        />
      </div>

      {/* 상태 표시줄 */}
      <div style={{
        padding: '4px 8px',
        backgroundColor: '#c0c0c0',
        borderTop: '2px solid #fff',
        fontSize: '12px',
        display: 'flex',
        gap: '20px'
      }}>
        <span>{sortedItems.length} object(s)</span>
        {selectedItemId && (
          <span>
            {sortedItems.find(i => i.id === selectedItemId)?.name}
          </span>
        )}
        {clipboard && (
          <span style={{ marginLeft: 'auto' }}>
            {clipboard.action === 'cut' ? '✂️ Cut:' : '📋 Copied:'} {clipboard.item.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default Explorer;
