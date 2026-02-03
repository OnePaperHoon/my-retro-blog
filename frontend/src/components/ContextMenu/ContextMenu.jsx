import { useEffect, useRef, useState } from 'react';
import { MenuList, MenuListItem, Separator } from 'react95';

const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x, y });
  const [submenuState, setSubmenuState] = useState({});

  useEffect(() => {
    // 화면 경계 체크 및 위치 조정
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // 오른쪽 경계 체크
      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      // 하단 경계 체크
      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      // 왼쪽 경계 체크
      if (adjustedX < 0) {
        adjustedX = 10;
      }

      // 상단 경계 체크
      if (adjustedY < 0) {
        adjustedY = 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  useEffect(() => {
    // 외부 클릭 감지
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    // ESC 키로 닫기
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleItemClick = (item, e) => {
    e.stopPropagation();

    if (item.disabled) return;

    if (item.submenu) {
      // 하위 메뉴가 있으면 토글
      setSubmenuState(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else {
      // 액션 실행 후 메뉴 닫기
      if (item.action) {
        item.action();
      }
      onClose();
    }
  };

  const renderMenuItem = (item, index) => {
    if (item.separator) {
      return <Separator key={`separator-${index}`} />;
    }

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = submenuState[item.id];

    return (
      <div key={item.id || index} style={{ position: 'relative' }}>
        <MenuListItem
          onClick={(e) => handleItemClick(item, e)}
          disabled={item.disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            padding: '4px 20px 4px 8px',
            cursor: item.disabled ? 'default' : 'pointer'
          }}
        >
          <span>
            {item.icon && <span style={{ marginRight: '8px' }}>{item.icon}</span>}
            {item.label}
          </span>
          {hasSubmenu && <span style={{ marginLeft: '20px' }}>▶</span>}
        </MenuListItem>

        {/* 하위 메뉴 렌더링 */}
        {hasSubmenu && isSubmenuOpen && (
          <div
            className="context-menu-submenu"
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              zIndex: 10000
            }}
          >
            <MenuList>
              {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
            </MenuList>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999
      }}
    >
      <MenuList style={{ minWidth: '180px' }}>
        {items.map((item, index) => renderMenuItem(item, index))}
      </MenuList>
    </div>
  );
};

export default ContextMenu;
