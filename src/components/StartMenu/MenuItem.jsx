import { useState } from 'react';
import { MenuListItem, Separator, MenuList } from 'react95';
import soundManager from '../../utils/sounds';

const MenuItem = ({ item, onClick, hasSubmenu, onSubmenuAction }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  if (item.separator) {
    return <Separator />;
  }

  const handleMouseEnter = () => {
    if (hasSubmenu) {
      setShowSubmenu(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasSubmenu) {
      setShowSubmenu(false);
    }
  };

  const handleClick = () => {
    if (item.action) {
      soundManager.click();
      item.action();
      if (onSubmenuAction) {
        onSubmenuAction();
      }
    } else if (!hasSubmenu) {
      onClick();
    }
  };

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MenuListItem
        onClick={handleClick}
        disabled={item.disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          backgroundColor: showSubmenu ? '#000080' : undefined,
          color: showSubmenu ? '#fff' : undefined
        }}
      >
        <span>
          {item.icon && <span style={{ marginRight: '8px' }}>{item.icon}</span>}
          {item.label}
        </span>
        {hasSubmenu && <span>▶</span>}
      </MenuListItem>

      {/* Submenu */}
      {hasSubmenu && showSubmenu && (
        <MenuList
          style={{
            position: 'absolute',
            left: '100%',
            top: 0,
            zIndex: 10000,
            minWidth: '180px'
          }}
        >
          {item.submenu.map((subItem, index) => (
            <MenuItem
              key={subItem.id || `sub-${index}`}
              item={subItem}
              onClick={() => {}}
              hasSubmenu={subItem.submenu && subItem.submenu.length > 0}
              onSubmenuAction={onSubmenuAction}
            />
          ))}
        </MenuList>
      )}
    </div>
  );
};

export default MenuItem;
