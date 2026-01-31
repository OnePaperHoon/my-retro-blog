const AddressBar = ({ currentPath }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '4px 8px',
      backgroundColor: '#c0c0c0',
      borderBottom: '1px solid #808080',
      fontSize: '13px'
    }}>
      <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Address:</span>
      <div style={{
        flex: 1,
        padding: '2px 6px',
        backgroundColor: '#fff',
        border: '2px inset #fff',
        fontFamily: 'monospace'
      }}>
        {currentPath}
      </div>
    </div>
  );
};

export default AddressBar;
