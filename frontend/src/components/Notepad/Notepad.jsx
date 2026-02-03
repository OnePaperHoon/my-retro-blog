import { useState, useRef, useEffect, useCallback } from 'react';
import { MenuList, MenuListItem, Separator } from 'react95';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NOTEPAD_STORAGE_KEY = 'notepad_files';
const MAX_UNDO_HISTORY = 50;

const Notepad = ({
  initialContent = '',
  fileName = 'Untitled',
  showMessageBox,
  showConfirm,
  showInput,
  onClose
}) => {
  const [content, setContent] = useState(initialContent);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const [wordWrap, setWordWrap] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [isModified, setIsModified] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const textareaRef = useRef(null);

  // Undo/Redo 히스토리
  const [undoHistory, setUndoHistory] = useState([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // 찾기/바꾸기 상태
  const [lastSearchText, setLastSearchText] = useState('');
  const [lastSearchIndex, setLastSearchIndex] = useState(-1);

  // 글꼴 설정
  const [fontSize, setFontSize] = useState(13);
  const [fontFamily, setFontFamily] = useState('Consolas, "Courier New", monospace');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // 히스토리에 현재 상태 추가
  const addToHistory = useCallback((newContent) => {
    setUndoHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      if (newHistory.length > MAX_UNDO_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_UNDO_HISTORY - 1));
  }, [historyIndex]);

  const handleTextChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsModified(true);
    addToHistory(newContent);
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
    setActiveMenu(null);
  };

  const handleKeyUp = (e) => {
    updateCursorPosition(e.target);
  };

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(undoHistory[newIndex]);
      setIsModified(true);
    }
  }, [historyIndex, undoHistory]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < undoHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(undoHistory[newIndex]);
      setIsModified(true);
    }
  }, [historyIndex, undoHistory]);

  // Cut
  const handleCut = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const selectedText = content.substring(start, end);
    navigator.clipboard.writeText(selectedText);

    const newContent = content.substring(0, start) + content.substring(end);
    setContent(newContent);
    addToHistory(newContent);
    setIsModified(true);

    setTimeout(() => {
      textarea.setSelectionRange(start, start);
      textarea.focus();
    }, 0);
  }, [content, addToHistory]);

  // Copy
  const handleCopy = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const selectedText = content.substring(start, end);
    navigator.clipboard.writeText(selectedText);
  }, [content]);

  // Paste
  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent = content.substring(0, start) + clipboardText + content.substring(end);
      setContent(newContent);
      addToHistory(newContent);
      setIsModified(true);

      setTimeout(() => {
        const newPos = start + clipboardText.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    } catch (e) {
      showMessageBox?.('Unable to access clipboard.', 'warning', 'Paste');
    }
  }, [content, addToHistory, showMessageBox]);

  // Delete
  const handleDelete = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let newContent;
    if (start === end) {
      // 선택 없으면 다음 문자 삭제
      newContent = content.substring(0, start) + content.substring(start + 1);
    } else {
      newContent = content.substring(0, start) + content.substring(end);
    }

    setContent(newContent);
    addToHistory(newContent);
    setIsModified(true);

    setTimeout(() => {
      textarea.setSelectionRange(start, start);
      textarea.focus();
    }, 0);
  }, [content, addToHistory]);

  const handleNew = async () => {
    if (isModified && showConfirm) {
      const save = await showConfirm(
        `Do you want to save changes to ${currentFileName}?`,
        { title: 'Notepad', buttonType: 'yesnocancel' }
      );
      if (save === null) return;
      if (save) handleSave();
    }

    setContent('');
    setCurrentFileName('Untitled');
    setIsModified(false);
    setUndoHistory(['']);
    setHistoryIndex(0);
  };

  // Open
  const handleOpen = async () => {
    if (!showInput) return;

    // localStorage에서 저장된 파일 목록 가져오기
    const savedFiles = JSON.parse(localStorage.getItem(NOTEPAD_STORAGE_KEY) || '{}');
    const fileNames = Object.keys(savedFiles);

    if (fileNames.length === 0) {
      showMessageBox?.('No saved files found.', 'info', 'Open');
      return;
    }

    const selectedFile = await showInput(
      `Available files:\n${fileNames.join(', ')}\n\nEnter file name to open:`,
      { title: 'Open', placeholder: 'filename.txt' }
    );

    if (selectedFile && savedFiles[selectedFile]) {
      if (isModified) {
        const save = await showConfirm?.(
          `Do you want to save changes to ${currentFileName}?`,
          { title: 'Notepad', buttonType: 'yesnocancel' }
        );
        if (save === null) return;
        if (save) handleSave();
      }

      setContent(savedFiles[selectedFile]);
      setCurrentFileName(selectedFile);
      setIsModified(false);
      setUndoHistory([savedFiles[selectedFile]]);
      setHistoryIndex(0);
    } else if (selectedFile) {
      showMessageBox?.(`File "${selectedFile}" not found.`, 'warning', 'Open');
    }
  };

  // Save
  const handleSave = useCallback(() => {
    const savedFiles = JSON.parse(localStorage.getItem(NOTEPAD_STORAGE_KEY) || '{}');
    savedFiles[currentFileName] = content;
    localStorage.setItem(NOTEPAD_STORAGE_KEY, JSON.stringify(savedFiles));
    setIsModified(false);
    showMessageBox?.(`File "${currentFileName}" has been saved.`, 'info', 'Save');
  }, [currentFileName, content, showMessageBox]);

  // Save As
  const handleSaveAs = async () => {
    if (!showInput) return;

    const newFileName = await showInput('Save as:', {
      title: 'Save As',
      placeholder: 'filename.txt',
      defaultValue: currentFileName
    });

    if (newFileName) {
      const savedFiles = JSON.parse(localStorage.getItem(NOTEPAD_STORAGE_KEY) || '{}');
      savedFiles[newFileName] = content;
      localStorage.setItem(NOTEPAD_STORAGE_KEY, JSON.stringify(savedFiles));
      setCurrentFileName(newFileName);
      setIsModified(false);
      showMessageBox?.(`File "${newFileName}" has been saved.`, 'info', 'Save As');
    }
  };

  // Find
  const handleFind = async () => {
    if (!showInput) return;

    const searchText = await showInput('Find what:', {
      title: 'Find',
      placeholder: 'Enter text to find',
      defaultValue: lastSearchText
    });

    if (searchText) {
      setLastSearchText(searchText);
      const index = content.toLowerCase().indexOf(searchText.toLowerCase());
      if (index !== -1) {
        setLastSearchIndex(index);
        textareaRef.current?.setSelectionRange(index, index + searchText.length);
        textareaRef.current?.focus();
      } else {
        setLastSearchIndex(-1);
        showMessageBox?.(`Cannot find "${searchText}"`, 'info', 'Notepad');
      }
    }
  };

  // Find Next
  const handleFindNext = useCallback(() => {
    if (!lastSearchText) {
      handleFind();
      return;
    }

    const startIndex = lastSearchIndex >= 0 ? lastSearchIndex + 1 : 0;
    const index = content.toLowerCase().indexOf(lastSearchText.toLowerCase(), startIndex);

    if (index !== -1) {
      setLastSearchIndex(index);
      textareaRef.current?.setSelectionRange(index, index + lastSearchText.length);
      textareaRef.current?.focus();
    } else {
      // 처음부터 다시 검색
      const firstIndex = content.toLowerCase().indexOf(lastSearchText.toLowerCase());
      if (firstIndex !== -1 && firstIndex !== lastSearchIndex) {
        setLastSearchIndex(firstIndex);
        textareaRef.current?.setSelectionRange(firstIndex, firstIndex + lastSearchText.length);
        textareaRef.current?.focus();
      } else {
        showMessageBox?.(`Cannot find "${lastSearchText}"`, 'info', 'Find Next');
      }
    }
  }, [lastSearchText, lastSearchIndex, content, showMessageBox]);

  // Replace
  const handleReplace = async () => {
    if (!showInput) return;

    const findText = await showInput('Find what:', {
      title: 'Replace',
      placeholder: 'Text to find',
      defaultValue: lastSearchText
    });

    if (!findText) return;
    setLastSearchText(findText);

    const replaceText = await showInput('Replace with:', {
      title: 'Replace',
      placeholder: 'Replacement text'
    });

    if (replaceText === null) return;

    // 현재 선택 영역이 찾는 텍스트와 일치하면 바꾸기
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;
    const selectedText = content.substring(start, end);

    if (selectedText.toLowerCase() === findText.toLowerCase()) {
      const newContent = content.substring(0, start) + replaceText + content.substring(end);
      setContent(newContent);
      addToHistory(newContent);
      setIsModified(true);

      setTimeout(() => {
        textarea?.setSelectionRange(start, start + replaceText.length);
        textarea?.focus();
      }, 0);
    }

    // 다음 일치 항목 찾기
    handleFindNext();
  };

  // Font 변경
  const handleFont = async () => {
    if (!showInput) return;

    const fonts = [
      'Consolas, monospace',
      'Courier New, monospace',
      'Arial, sans-serif',
      'Times New Roman, serif',
      'Verdana, sans-serif'
    ];

    const sizeInput = await showInput(
      `Current font size: ${fontSize}\nEnter new font size (8-72):`,
      { title: 'Font', placeholder: '13', defaultValue: String(fontSize) }
    );

    if (sizeInput) {
      const newSize = parseInt(sizeInput);
      if (newSize >= 8 && newSize <= 72) {
        setFontSize(newSize);
      }
    }
  };

  const handleAbout = () => {
    showMessageBox?.(
      'Notepad\nVersion 2.0\n\nA text editor with Undo/Redo, Find/Replace, and file management.\n\n© 2025 OnePaperHoon',
      'info',
      'About Notepad'
    );
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < undoHistory.length - 1;

  const menuItems = {
    File: [
      { label: 'New', shortcut: 'Ctrl+N', action: handleNew },
      { separator: true },
      { label: 'Open...', shortcut: 'Ctrl+O', action: handleOpen },
      { label: 'Save', shortcut: 'Ctrl+S', action: handleSave },
      { label: 'Save As...', action: handleSaveAs },
      { separator: true },
      { label: 'Page Setup...', disabled: true },
      { label: 'Print...', shortcut: 'Ctrl+P', disabled: true },
      { separator: true },
      { label: 'Exit', action: onClose }
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: handleUndo, disabled: !canUndo },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: handleRedo, disabled: !canRedo },
      { separator: true },
      { label: 'Cut', shortcut: 'Ctrl+X', action: handleCut },
      { label: 'Copy', shortcut: 'Ctrl+C', action: handleCopy },
      { label: 'Paste', shortcut: 'Ctrl+V', action: handlePaste },
      { label: 'Delete', shortcut: 'Del', action: handleDelete },
      { separator: true },
      { label: 'Find...', shortcut: 'Ctrl+F', action: handleFind },
      { label: 'Find Next', shortcut: 'F3', action: handleFindNext },
      { label: 'Replace...', shortcut: 'Ctrl+H', action: handleReplace },
      { separator: true },
      { label: 'Select All', shortcut: 'Ctrl+A', action: () => textareaRef.current?.select() }
    ],
    Format: [
      {
        label: wordWrap ? '✓ Word Wrap' : 'Word Wrap',
        action: () => setWordWrap(!wordWrap)
      },
      { label: 'Font...', action: handleFont }
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
      { label: 'Help Topics', action: () => showMessageBox?.('Keyboard shortcuts:\n\nCtrl+Z: Undo\nCtrl+Y: Redo\nCtrl+X: Cut\nCtrl+C: Copy\nCtrl+V: Paste\nCtrl+F: Find\nF3: Find Next\nCtrl+H: Replace\nCtrl+S: Save\nCtrl+M: Markdown Preview', 'info', 'Help') },
      { separator: true },
      { label: 'About Notepad', action: handleAbout }
    ]
  };

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item) => {
    if (item.action && !item.disabled) {
      item.action();
    }
    setActiveMenu(null);
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'n':
            e.preventDefault();
            handleNew();
            break;
          case 'o':
            e.preventDefault();
            handleOpen();
            break;
          case 'f':
            e.preventDefault();
            handleFind();
            break;
          case 'h':
            e.preventDefault();
            handleReplace();
            break;
          case 'z':
            e.preventDefault();
            handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'm':
            e.preventDefault();
            setPreviewMode(prev => !prev);
            break;
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleFindNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, handleFindNext]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => setActiveMenu(null)}>
      {/* 메뉴 바 */}
      <div style={{
        display: 'flex',
        backgroundColor: '#c0c0c0',
        borderBottom: '2px solid #808080',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
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

            {activeMenu === menuName && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000 }}>
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
            fontFamily: fontFamily,
            fontSize: `${fontSize}px`,
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
            {previewMode ? '📖 Preview Mode' : (isModified ? `Modified - ${currentFileName}` : currentFileName)}
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
