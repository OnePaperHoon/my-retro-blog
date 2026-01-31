import { useState } from 'react';
import { TextInput } from 'react95';
import Dialog from './Dialog';

const InputDialog = ({
  title = 'Input',
  message,
  defaultValue = '',
  placeholder = '',
  onConfirm,
  onCancel
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog
      title={title}
      icon="✏️"
      width={400}
      onClose={onCancel}
      buttons={[
        {
          label: 'OK',
          onClick: handleConfirm,
          primary: true,
          disabled: !value.trim()
        },
        {
          label: 'Cancel',
          onClick: onCancel
        }
      ]}
    >
      <div>
        {message && (
          <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
            {message}
          </p>
        )}
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          style={{ width: '100%' }}
          autoFocus
        />
      </div>
    </Dialog>
  );
};

export default InputDialog;
