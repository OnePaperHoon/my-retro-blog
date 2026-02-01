import { useState } from 'react';
import styled from 'styled-components';

const ContextMenu = styled.div`
  position: fixed;
  background: #c0c0c0;
  border: 2px outset #fff;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  min-width: 150px;
  z-index: 10000;
  font-size: 13px;
`;

const MenuItem = styled.div`
  padding: 4px 20px;
  cursor: pointer;

  &:hover {
    background: #000080;
    color: #fff;
  }

  ${props => props.$disabled && `
    color: #808080;
    pointer-events: none;
  `}
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #808080;
  margin: 4px 2px;
`;

const FileList = ({ items = [], viewMode = 'details', onItemDoubleClick, onItemClick, selectedItemId, onDeleteItem, isAuthenticated, onMoveItem }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  // 드래그 시작
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    // 드래그 이미지 설정 (선택사항)
    if (e.target.style) {
      e.target.style.opacity = '0.5';
    }
  };

  // 드래그 종료
  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDropTargetId(null);
    if (e.target.style) {
      e.target.style.opacity = '1';
    }
  };

  // 드래그 오버 (폴더 위에 있을 때)
  const handleDragOver = (e, item) => {
    e.preventDefault();
    if (item.type === 'folder' && draggedItem && draggedItem.id !== item.id) {
      e.dataTransfer.dropEffect = 'move';
      setDropTargetId(item.id);
    }
  };

  // 드래그 떠남
  const handleDragLeave = (e) => {
    setDropTargetId(null);
  };

  // 드롭
  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    setDropTargetId(null);

    if (!draggedItem || !targetItem || targetItem.type !== 'folder') return;
    if (draggedItem.id === targetItem.id) return;

    // 부모로 드롭하려는 경우 방지
    if (draggedItem.type === 'folder' && targetItem.path?.startsWith(draggedItem.path)) return;

    if (onMoveItem) {
      onMoveItem(draggedItem, targetItem);
    }

    setDraggedItem(null);
  };

  const getFileIcon = (item) => {
    if (item.type === 'folder') {
      return item.icon || '📁';
    }

    const ext = item.name.split('.').pop().toLowerCase();
    const iconMap = {
      'md': '📝',
      'txt': '📄',
      'pdf': '📕',
      'json': '📋',
      'url': '🔗',
      'jpg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️'
    };
    return iconMap[ext] || '📄';
  };

  // MongoDB ObjectId 형식인지 확인
  const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    onItemClick(item);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu?.item && onDeleteItem) {
      onDeleteItem(contextMenu.item);
    }
    handleCloseContextMenu();
  };

  const handleOpen = () => {
    if (contextMenu?.item) {
      onItemDoubleClick(contextMenu.item);
    }
    handleCloseContextMenu();
  };

  // 컨텍스트 메뉴 렌더링
  const renderContextMenuOverlay = () => {
    if (!contextMenu) return null;
    const canDelete = isMongoId(contextMenu.item?.id) && isAuthenticated;
    return (
      <>
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={handleCloseContextMenu}
        />
        <ContextMenu style={{ left: contextMenu.x, top: contextMenu.y }}>
          <MenuItem onClick={handleOpen}>Open</MenuItem>
          <MenuDivider />
          <MenuItem $disabled={!canDelete} onClick={canDelete ? handleDelete : undefined}>
            Delete {!canDelete && '(Login required)'}
          </MenuItem>
        </ContextMenu>
      </>
    );
  };

  if (viewMode === 'details') {
    return (
      <div style={{
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#fff',
        border: '2px inset #fff'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          padding: '4px 8px',
          backgroundColor: '#c0c0c0',
          borderBottom: '2px solid #808080',
          fontWeight: 'bold',
          fontSize: '13px'
        }}>
          <div>Name</div>
          <div>Size</div>
          <div>Type</div>
          <div>Modified</div>
        </div>

        {/* 아이템 목록 */}
        {items.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#808080' }}>
            This folder is empty
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              onClick={() => onItemClick(item)}
              onDoubleClick={() => onItemDoubleClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '4px 8px',
                cursor: draggedItem ? (item.type === 'folder' && draggedItem.id !== item.id ? 'copy' : 'no-drop') : 'pointer',
                backgroundColor: dropTargetId === item.id ? '#90EE90' : (selectedItemId === item.id ? '#000080' : 'transparent'),
                color: dropTargetId === item.id ? '#000' : (selectedItemId === item.id ? '#fff' : '#000'),
                fontSize: '13px',
                userSelect: 'none',
                border: dropTargetId === item.id ? '2px dashed #006400' : '2px solid transparent',
                transition: 'background-color 0.15s, border 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{getFileIcon(item)}</span>
                <span>{item.name}</span>
              </div>
              <div>{item.size || ''}</div>
              <div>{item.type === 'folder' ? 'File Folder' : 'File'}</div>
              <div>{item.modified || ''}</div>
            </div>
          ))
        )}
        {renderContextMenuOverlay()}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div style={{
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#fff',
        border: '2px inset #fff',
        padding: '4px'
      }}>
        {items.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#808080' }}>
            This folder is empty
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              onClick={() => onItemClick(item)}
              onDoubleClick={() => onItemDoubleClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 4px',
                cursor: draggedItem ? (item.type === 'folder' && draggedItem.id !== item.id ? 'copy' : 'no-drop') : 'pointer',
                backgroundColor: dropTargetId === item.id ? '#90EE90' : (selectedItemId === item.id ? '#000080' : 'transparent'),
                color: dropTargetId === item.id ? '#000' : (selectedItemId === item.id ? '#fff' : '#000'),
                fontSize: '13px',
                userSelect: 'none',
                border: dropTargetId === item.id ? '2px dashed #006400' : '2px solid transparent',
                transition: 'background-color 0.15s, border 0.15s'
              }}
            >
              <span>{getFileIcon(item)}</span>
              <span>{item.name}</span>
            </div>
          ))
        )}
        {renderContextMenuOverlay()}
      </div>
    );
  }

  // Large Icons
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#fff',
      border: '2px inset #fff',
      padding: '10px',
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      gap: '10px'
    }}>
      {items.length === 0 ? (
        <div style={{ padding: '20px', width: '100%', textAlign: 'center', color: '#808080' }}>
          This folder is empty
        </div>
      ) : (
        items.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item)}
            onClick={() => onItemClick(item)}
            onDoubleClick={() => onItemDoubleClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '80px',
              padding: '8px',
              cursor: draggedItem ? (item.type === 'folder' && draggedItem.id !== item.id ? 'copy' : 'no-drop') : 'pointer',
              backgroundColor: dropTargetId === item.id ? '#90EE90' : (selectedItemId === item.id ? '#000080' : 'transparent'),
              color: dropTargetId === item.id ? '#000' : (selectedItemId === item.id ? '#fff' : '#000'),
              fontSize: '12px',
              textAlign: 'center',
              userSelect: 'none',
              borderRadius: '2px',
              border: dropTargetId === item.id ? '2px dashed #006400' : '2px solid transparent',
              transition: 'background-color 0.15s, border 0.15s'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>
              {getFileIcon(item)}
            </div>
            <div style={{ wordBreak: 'break-word' }}>{item.name}</div>
          </div>
        ))
      )}
      {renderContextMenuOverlay()}
    </div>
  );
};

export default FileList;
