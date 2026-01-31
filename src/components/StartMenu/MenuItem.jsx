import { MenuListItem, Separator } from 'react95';

const MenuItem = ({ item, onClick, hasSubmenu }) => {
  if (item.separator) {
    return <Separator />;
  }

  return (
    <MenuListItem
      onClick={onClick}
      disabled={item.disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px'
      }}
    >
      <span>
        {item.icon && <span style={{ marginRight: '8px' }}>{item.icon}</span>}
        {item.label}
      </span>
      {hasSubmenu && <span>▶</span>}
    </MenuListItem>
  );
};

export default MenuItem;
