import { useState, useEffect } from 'react';
import { WindowContent, MenuList, MenuListItem, Separator } from 'react95';
import FolderTree from './FolderTree';
import FileList from './FileList';
import Toolbar from './Toolbar';
import AddressBar from './AddressBar';
import { fileSystem as localFileSystem, findNodeByPath as localFindNodeByPath, findNodeById } from '../../data/fileSystem';
import { filesAPI, postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

// 로컬 데이터와 API 데이터를 병합
const mergeFileSystem = (local, apiData, blogPosts = []) => {
  const additionalFolders = [];

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

  if (additionalFolders.length === 0) return local;

  return {
    ...local,
    children: [...additionalFolders, ...(local.children || [])]
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

  // File 메뉴 상태
  const [fileMenuOpen, setFileMenuOpen] = useState(false);

  const handleMenuClick = async (menu) => {
    if (menu === 'Help' && showMessageBox) {
      showMessageBox(
        'Windows 98 Explorer\n\nUse this to browse your files and folders.\n\nDouble-click folders to open them.\nDouble-click files to view them.',
        'info',
        'Help'
      );
    } else if (menu === 'File') {
      setFileMenuOpen(!fileMenuOpen);
    }
  };

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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => setFileMenuOpen(false)}>
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
              backgroundColor: menu === 'File' && fileMenuOpen ? '#000080' : 'transparent',
              color: menu === 'File' && fileMenuOpen ? '#fff' : '#000'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(menu);
            }}
          >
            {menu}
            {/* File 드롭다운 메뉴 */}
            {menu === 'File' && fileMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                minWidth: '150px',
                zIndex: 1000
              }}>
                <div
                  style={{ padding: '4px 20px', cursor: 'pointer', color: '#000' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#000080'; e.target.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#000'; }}
                  onClick={(e) => { e.stopPropagation(); setFileMenuOpen(false); handleCreateFolder(); }}
                >
                  📁 New Folder
                </div>
                <div
                  style={{ padding: '4px 20px', cursor: 'pointer', color: '#000' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#000080'; e.target.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#000'; }}
                  onClick={(e) => { e.stopPropagation(); setFileMenuOpen(false); handleCreateFile(); }}
                >
                  📄 New Text File
                </div>
                <div style={{ height: '1px', backgroundColor: '#808080', margin: '4px 2px' }} />
                <div
                  style={{ padding: '4px 20px', cursor: 'pointer', color: '#808080' }}
                >
                  Close
                </div>
              </div>
            )}
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
          items={items}
          viewMode={viewMode}
          isAuthenticated={isAuthenticated}
          onDeleteItem={handleDeleteItem}
          onMoveItem={handleMoveItem}
          onItemDoubleClick={handleItemDoubleClick}
          onItemClick={handleItemClick}
          selectedItemId={selectedItemId}
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
        <span>{items.length} object(s)</span>
        {selectedItemId && (
          <span>
            {items.find(i => i.id === selectedItemId)?.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default Explorer;
