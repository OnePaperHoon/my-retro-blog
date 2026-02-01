import { useState } from 'react';

const FolderTreeItem = ({ node, selectedPath, onSelect, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0 || level === 1);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onSelect(node);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '2px 4px',
          paddingLeft: `${level * 16 + 4}px`,
          cursor: 'pointer',
          backgroundColor: isSelected ? '#000080' : 'transparent',
          color: isSelected ? '#fff' : '#000',
          fontSize: '13px',
          userSelect: 'none'
        }}
      >
        {hasChildren && (
          <span style={{ marginRight: '4px', width: '12px' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span style={{ marginRight: '4px', width: '12px' }}></span>}
        <span style={{ marginRight: '6px' }}>
          {node.type === 'folder' ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span>{node.name}</span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children
            .filter(child => child.type === 'folder')
            .map(child => (
              <FolderTreeItem
                key={child.id}
                node={child}
                selectedPath={selectedPath}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({ rootNode, selectedPath, onSelectFolder }) => {
  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#fff',
        border: '2px inset #fff',
        padding: '4px'
      }}
    >
      <FolderTreeItem
        node={rootNode}
        selectedPath={selectedPath}
        onSelect={onSelectFolder}
      />
    </div>
  );
};

export default FolderTree;
