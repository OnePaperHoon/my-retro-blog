const DesktopIcon = ({ name, iconUrl, onDoubleClick }) => {
  return (
    <div 
      onDoubleClick={onDoubleClick}
      style={{
        width: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        margin: '10px',
        textAlign: 'center'
      }}
    >
      <img src={iconUrl} alt={name} style={{ width: '40px', height: '40px', marginBottom: '4px' }} />
      <span style={{ 
        color: 'white', 
        fontSize: '12px', 
        padding: '2px',
        textShadow: '1px 1px #000'
      }}>
        {name}
      </span>
    </div>
  );
};