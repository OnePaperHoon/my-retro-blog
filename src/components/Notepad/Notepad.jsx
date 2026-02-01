import { useState, useRef, useEffect } from 'react';
import { MenuList, MenuListItem, Separator } from 'react95';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Notepad = ({
  initialContent = '',
  fileName = 'Untitled',
  showMessageBox,
  showConfirm,
  showInput,
  onClose
}) => {
  const [content, setContent] = useState(initialContent);
  const [wordWrap, setWordWrap] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [isModified, setIsModified] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleTextChange = (e) => {
    setContent(e.target.value);
    setIsModified(true);
    updateCursorPosition(e.target);
  };

  const updateCursorPosition = (textarea) => {
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPosition({ line, col });
  };

  const handleClick = (e) => {
    updateCursorPosition(e.target);
  };

  const handleKeyUp = (e) => {
    updateCursorPosition(e.target);
  };

  const handleNew = async () => {
    if (isModified && showConfirm) {
      const save = await showConfirm(
        `Do you want to save changes to ${fileName}?`,
        {
          title: 'Notepad',
          buttonType: 'yesnocancel'
        }
      );
      if (save === null) return; // Cancelled
    }

    setContent('');
    setIsModified(false);
  };

  const handleSave = () => {
    if (showMessageBox) {
      showMessageBox(
        `File "${fileName}" has been saved.\n\n(Feature not fully implemented)`,
        'info',
        'Save'
      );
    }
    setIsModified(false);
  };

  const handleFind = async () => {
    if (showInput) {
      const searchText = await showInput('Find what:', {
        title: 'Find',
        placeholder: 'Enter text to find'
      });

      if (searchText) {
        const index = content.toLowerCase().indexOf(searchText.toLowerCase());
        if (index !== -1) {
          textareaRef.current.setSelectionRange(index, index + searchText.length);
          textareaRef.current.focus();
        } else if (showMessageBox) {
          showMessageBox(
            `Cannot find "${searchText}"`,
            'info',
            'Notepad'
          );
        }
      }
    }
  };

  const handleAbout = () => {
    if (showMessageBox) {
      showMessageBox(
        'Notepad\nVersion 1.0\n\nA simple text editor built with React.\n\n© 2025 OnePaperHoon',
        'info',
        'About Notepad'
      );
    }
  };

  const menuItems = {
    File: [
      { label: 'New', shortcut: 'Ctrl+N', action: handleNew },
      { separator: true },
      { label: 'Open...', shortcut: 'Ctrl+O', disabled: true },
      { label: 'Save', shortcut: 'Ctrl+S', action: handleSave },
      { label: 'Save As...', disabled: true },
      { separator: true },
      { label: 'Page Setup...', disabled: true },
      { label: 'Print...', shortcut: 'Ctrl+P', disabled: true },
      { separator: true },
      { label: 'Exit', action: onClose }
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', disabled: true },
      { separator: true },
      { label: 'Cut', shortcut: 'Ctrl+X', disabled: true },
      { label: 'Copy', shortcut: 'Ctrl+C', disabled: true },
      { label: 'Paste', shortcut: 'Ctrl+V', disabled: true },
      { label: 'Delete', shortcut: 'Del', disabled: true },
      { separator: true },
      { label: 'Find...', shortcut: 'Ctrl+F', action: handleFind },
      { label: 'Find Next', shortcut: 'F3', disabled: true },
      { label: 'Replace...', shortcut: 'Ctrl+H', disabled: true },
      { separator: true },
      { label: 'Select All', shortcut: 'Ctrl+A', action: () => textareaRef.current?.select() }
    ],
    Format: [
      {
        label: wordWrap ? '✓ Word Wrap' : 'Word Wrap',
        action: () => setWordWrap(!wordWrap)
      },
      { label: 'Font...', disabled: true }
    ],
    View: [
      {
        label: previewMode ? '✓ Markdown Preview' : 'Markdown Preview',
        shortcut: 'Ctrl+M',
        action: () => setPreviewMode(!previewMode)
      },
      { separator: true },
      {
        label: showStatusBar ? '✓ Status Bar' : 'Status Bar',
        action: () => setShowStatusBar(!showStatusBar)
      }
    ],
    Help: [
      { label: 'Help Topics', disabled: true },
      { separator: true },
      { label: 'About Notepad', action: handleAbout }
    ]
  };

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item) => {
    if (item.action) {
      item.action();
    }
    setActiveMenu(null);
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'n') {
          e.preventDefault();
          handleNew();
        } else if (e.key === 'f') {
          e.preventDefault();
          handleFind();
        } else if (e.key === 'm') {
          e.preventDefault();
          setPreviewMode(prev => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModified, content]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 메뉴 바 */}
      <div style={{
        display: 'flex',
        backgroundColor: '#c0c0c0',
        borderBottom: '2px solid #808080',
        position: 'relative'
      }}>
        {Object.keys(menuItems).map(menuName => (
          <div key={menuName} style={{ position: 'relative' }}>
            <div
              onClick={() => handleMenuClick(menuName)}
              style={{
                padding: '4px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                userSelect: 'none',
                backgroundColor: activeMenu === menuName ? '#000080' : 'transparent',
                color: activeMenu === menuName ? '#fff' : '#000'
              }}
            >
              {menuName}
            </div>

            {/* 드롭다운 메뉴 */}
            {activeMenu === menuName && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 1000
                }}
              >
                <MenuList style={{ minWidth: '200px' }}>
                  {menuItems[menuName].map((item, index) => {
                    if (item.separator) {
                      return <Separator key={`sep-${index}`} />;
                    }
                    return (
                      <MenuListItem
                        key={index}
                        onClick={() => handleMenuItemClick(item)}
                        disabled={item.disabled}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px'
                        }}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span style={{ marginLeft: '30px', color: '#808080' }}>
                            {item.shortcut}
                          </span>
                        )}
                      </MenuListItem>
                    );
                  })}
                </MenuList>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 텍스트 편집 영역 / 마크다운 미리보기 */}
      {previewMode ? (
        <div
          style={{
            flex: 1,
            padding: '12px 16px',
            overflow: 'auto',
            backgroundColor: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
          className="markdown-preview"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 style={{fontSize: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px'}} {...props} />,
              h2: ({node, ...props}) => <h2 style={{fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '12px'}} {...props} />,
              h3: ({node, ...props}) => <h3 style={{fontSize: '16px', marginBottom: '8px'}} {...props} />,
              p: ({node, ...props}) => <p style={{marginBottom: '12px'}} {...props} />,
              ul: ({node, ...props}) => <ul style={{marginBottom: '12px', paddingLeft: '24px'}} {...props} />,
              ol: ({node, ...props}) => <ol style={{marginBottom: '12px', paddingLeft: '24px'}} {...props} />,
              li: ({node, ...props}) => <li style={{marginBottom: '4px'}} {...props} />,
              code: ({node, inline, ...props}) =>
                inline
                  ? <code style={{backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', fontFamily: 'Consolas, monospace', fontSize: '13px'}} {...props} />
                  : <code style={{display: 'block', backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderRadius: '4px', fontFamily: 'Consolas, monospace', fontSize: '13px', overflow: 'auto', marginBottom: '12px'}} {...props} />,
              pre: ({node, ...props}) => <pre style={{margin: 0}} {...props} />,
              blockquote: ({node, ...props}) => <blockquote style={{borderLeft: '4px solid #ddd', margin: '0 0 12px 0', padding: '8px 16px', backgroundColor: '#f9f9f9'}} {...props} />,
              a: ({node, ...props}) => <a style={{color: '#0066cc'}} {...props} />,
              table: ({node, ...props}) => <table style={{borderCollapse: 'collapse', marginBottom: '12px', width: '100%'}} {...props} />,
              th: ({node, ...props}) => <th style={{border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'left'}} {...props} />,
              td: ({node, ...props}) => <td style={{border: '1px solid #ddd', padding: '8px'}} {...props} />,
              hr: ({node, ...props}) => <hr style={{border: 'none', borderTop: '1px solid #ddd', margin: '16px 0'}} {...props} />,
              img: ({node, ...props}) => <img style={{maxWidth: '100%', height: 'auto'}} {...props} />
            }}
          >
            {content || '*No content to preview*'}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onClick={handleClick}
          onKeyUp={handleKeyUp}
          spellCheck={false}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: '1.4',
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            overflowWrap: wordWrap ? 'break-word' : 'normal',
            overflowX: wordWrap ? 'hidden' : 'auto'
          }}
        />
      )}

      {/* 상태 표시줄 */}
      {showStatusBar && (
        <div style={{
          padding: '4px 8px',
          backgroundColor: '#c0c0c0',
          borderTop: '2px solid #fff',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>
            {previewMode ? '📖 Preview Mode' : (isModified ? 'Modified' : 'Saved')}
          </span>
          <span>
            {previewMode ? 'Ctrl+M to edit' : `Ln ${cursorPosition.line}, Col ${cursorPosition.col}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default Notepad;
