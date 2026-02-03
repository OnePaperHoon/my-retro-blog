import { useState } from 'react';

const useDialog = () => {
  const [dialog, setDialog] = useState(null);

  const showMessageBox = (message, type = 'info', title = null) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'message',
        props: {
          message,
          type,
          title,
          onClose: () => {
            setDialog(null);
            resolve();
          }
        }
      });
    });
  };

  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      const {
        title = 'Confirm',
        type = 'question',
        buttonType = 'yesno'
      } = options;

      setDialog({
        type: 'confirm',
        props: {
          message,
          title,
          type,
          buttonType,
          onConfirm: () => {
            setDialog(null);
            resolve(true);
          },
          onCancel: () => {
            setDialog(null);
            resolve(false);
          },
          onNo: () => {
            setDialog(null);
            resolve(false);
          }
        }
      });
    });
  };

  const showInput = (message, options = {}) => {
    return new Promise((resolve) => {
      const {
        title = 'Input',
        defaultValue = '',
        placeholder = ''
      } = options;

      setDialog({
        type: 'input',
        props: {
          message,
          title,
          defaultValue,
          placeholder,
          onConfirm: (value) => {
            setDialog(null);
            resolve(value);
          },
          onCancel: () => {
            setDialog(null);
            resolve(null);
          }
        }
      });
    });
  };

  const showProgress = (options = {}) => {
    const {
      title = 'Progress',
      message = 'Please wait...',
      progress = -1, // -1 for indeterminate
      showCancel = false,
      onCancel = null
    } = options;

    setDialog({
      type: 'progress',
      props: {
        title,
        message,
        progress,
        showCancel,
        onCancel: () => {
          setDialog(null);
          if (onCancel) onCancel();
        },
        onComplete: () => {
          setDialog(null);
        }
      }
    });

    // Return control functions
    return {
      updateProgress: (newProgress, newMessage) => {
        setDialog(prev => prev ? {
          ...prev,
          props: {
            ...prev.props,
            progress: newProgress,
            message: newMessage !== undefined ? newMessage : prev.props.message
          }
        } : null);
      },
      close: () => setDialog(null)
    };
  };

  const closeDialog = () => {
    setDialog(null);
  };

  return {
    dialog,
    showMessageBox,
    showConfirm,
    showInput,
    showProgress,
    closeDialog
  };
};

export default useDialog;
