import Dialog from './Dialog';

const ConfirmDialog = ({
  title = 'Confirm',
  message,
  type = 'question', // 'question', 'warning', 'info'
  buttonType = 'yesno', // 'yesno', 'okcancel', 'yesnocancel'
  onConfirm,
  onCancel,
  onNo
}) => {
  const icons = {
    question: '❓',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const getButtons = () => {
    if (buttonType === 'yesno') {
      return [
        {
          label: 'Yes',
          onClick: () => {
            if (onConfirm) onConfirm();
          },
          primary: true
        },
        {
          label: 'No',
          onClick: () => {
            if (onNo || onCancel) (onNo || onCancel)();
          }
        }
      ];
    }

    if (buttonType === 'yesnocancel') {
      return [
        {
          label: 'Yes',
          onClick: () => {
            if (onConfirm) onConfirm();
          },
          primary: true
        },
        {
          label: 'No',
          onClick: () => {
            if (onNo) onNo();
          }
        },
        {
          label: 'Cancel',
          onClick: () => {
            if (onCancel) onCancel();
          }
        }
      ];
    }

    // okcancel
    return [
      {
        label: 'OK',
        onClick: () => {
          if (onConfirm) onConfirm();
        },
        primary: true
      },
      {
        label: 'Cancel',
        onClick: () => {
          if (onCancel) onCancel();
        }
      }
    ];
  };

  return (
    <Dialog
      title={title}
      icon={icons[type]}
      width={350}
      onClose={onCancel}
      buttons={getButtons()}
    >
      <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
        {message}
      </p>
    </Dialog>
  );
};

export default ConfirmDialog;
