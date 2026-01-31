import { useState, useCallback } from 'react';

const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState(null);

  const showContextMenu = useCallback((e, items) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
};

export default useContextMenu;
