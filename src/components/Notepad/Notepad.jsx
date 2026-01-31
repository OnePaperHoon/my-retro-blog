import { useState, useRef, useEffect } from 'react';
import { MenuList, MenuListItem, Separator } from 'react95';

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

      {/* 텍스트 편집 영역 */}
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
          <span>{isModified ? 'Modified' : 'Saved'}</span>
          <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
        </div>
      )}
    </div>
  );
};

export default Notepad;
