import { useState } from 'react';
import { WindowContent, MenuList, MenuListItem, Separator } from 'react95';
import FolderTree from './FolderTree';
import FileList from './FileList';
import Toolbar from './Toolbar';
import AddressBar from './AddressBar';
import { fileSystem, findNodeByPath, findNodeById } from '../../data/fileSystem';

const Explorer = ({ onOpenFile, showMessageBox, showConfirm, showInput }) => {
  const [currentNode, setCurrentNode] = useState(
    findNodeByPath('C:\\My Documents\\Projects') || fileSystem.children[0]
  );
  const [history, setHistory] = useState([currentNode.path]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState('details'); // 'icons', 'list', 'details'
  const [selectedItemId, setSelectedItemId] = useState(null);

  const navigateTo = (node) => {
    if (!node || node.type !== 'folder') return;

    // 히스토리 업데이트
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

  const items = currentNode.children || [];

  const handleMenuClick = async (menu) => {
    if (menu === 'Help' && showMessageBox) {
      showMessageBox(
        'Windows 98 Explorer\n\nUse this to browse your files and folders.\n\nDouble-click folders to open them.\nDouble-click files to view them.',
        'info',
        'Help'
      );
    } else if (menu === 'File' && showInput) {
      const folderName = await showInput('Enter folder name:', {
        title: 'New Folder',
        placeholder: 'New Folder'
      });
      if (folderName) {
        showMessageBox(`Folder "${folderName}" would be created.\n\n(Feature not fully implemented)`, 'info');
      }
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 메뉴 바 */}
      <div style={{
        display: 'flex',
        backgroundColor: '#c0c0c0',
        borderBottom: '2px solid #808080'
      }}>
        {['File', 'Edit', 'View', 'Go', 'Favorites', 'Help'].map(menu => (
          <div
            key={menu}
            style={{
              padding: '4px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={() => handleMenuClick(menu)}
          >
            {menu}
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
