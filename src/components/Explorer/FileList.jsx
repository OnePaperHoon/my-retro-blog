import { useState } from 'react';

const FileList = ({ items = [], viewMode = 'details', onItemDoubleClick, onItemClick, selectedItemId }) => {

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
              onClick={() => onItemClick(item)}
              onDoubleClick={() => onItemDoubleClick(item)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '4px 8px',
                cursor: 'pointer',
                backgroundColor: selectedItemId === item.id ? '#000080' : 'transparent',
                color: selectedItemId === item.id ? '#fff' : '#000',
                fontSize: '13px',
                userSelect: 'none'
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
              onClick={() => onItemClick(item)}
              onDoubleClick={() => onItemDoubleClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 4px',
                cursor: 'pointer',
                backgroundColor: selectedItemId === item.id ? '#000080' : 'transparent',
                color: selectedItemId === item.id ? '#fff' : '#000',
                fontSize: '13px',
                userSelect: 'none'
              }}
            >
              <span>{getFileIcon(item)}</span>
              <span>{item.name}</span>
            </div>
          ))
        )}
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
            onClick={() => onItemClick(item)}
            onDoubleClick={() => onItemDoubleClick(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '80px',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: selectedItemId === item.id ? '#000080' : 'transparent',
              color: selectedItemId === item.id ? '#fff' : '#000',
              fontSize: '12px',
              textAlign: 'center',
              userSelect: 'none',
              borderRadius: '2px'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>
              {getFileIcon(item)}
            </div>
            <div style={{ wordBreak: 'break-word' }}>{item.name}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default FileList;
