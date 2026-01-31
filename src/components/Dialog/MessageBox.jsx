import Dialog from './Dialog';

const MessageBox = ({
  title = 'Message',
  message,
  type = 'info', // 'info', 'warning', 'error', 'question'
  onClose
}) => {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    question: '❓'
  };

  const titles = {
    info: 'Information',
    warning: 'Warning',
    error: 'Error',
    question: 'Question'
  };

  return (
    <Dialog
      title={title || titles[type]}
      icon={icons[type]}
      width={350}
      onClose={onClose}
      buttons={[
        {
          label: 'OK',
          onClick: onClose,
          primary: true
        }
      ]}
    >
      <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
        {message}
      </p>
    </Dialog>
  );
};

export default MessageBox;
