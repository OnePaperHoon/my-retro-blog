import { useState } from 'react';
import Dialog from './Dialog';

const ShutDownDialog = ({ onClose }) => {
  const [selectedOption, setSelectedOption] = useState('shutdown');

  const handleOk = () => {
    if (selectedOption === 'shutdown') {
      // 실제로는 화면을 검은색으로 만들거나 종료 화면 표시
      alert('💻 System is shutting down...\n\nThank you for visiting OnePaperHoon.com!');
      window.close();
    } else if (selectedOption === 'restart') {
      alert('🔄 System is restarting...');
      window.location.reload();
    } else if (selectedOption === 'logoff') {
      alert('👋 Logging off...');
      window.location.reload();
    }
    onClose();
  };

  const options = [
    { value: 'shutdown', label: 'Shut down', icon: '🔌' },
    { value: 'restart', label: 'Restart', icon: '🔄' },
    { value: 'logoff', label: 'Log off OnePaperHoon', icon: '👤' }
  ];

  return (
    <Dialog
      title="Shut Down Windows"
      icon="💻"
      width={350}
      onClose={onClose}
      buttons={[
        {
          label: 'OK',
          onClick: handleOk,
          primary: true
        },
        {
          label: 'Cancel',
          onClick: onClose
        }
      ]}
    >
      <div>
        <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>
          What do you want the computer to do?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px',
                backgroundColor: selectedOption === option.value ? '#e0e0e0' : 'transparent'
              }}
            >
              <input
                type="radio"
                name="shutdown-option"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => setSelectedOption(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ marginRight: '8px' }}>{option.icon}</span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </Dialog>
  );
};

export default ShutDownDialog;
