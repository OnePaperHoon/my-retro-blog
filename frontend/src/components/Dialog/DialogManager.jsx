import MessageBox from './MessageBox';
import ConfirmDialog from './ConfirmDialog';
import InputDialog from './InputDialog';
import ProgressDialog from './ProgressDialog';

const DialogManager = ({ dialog }) => {
  if (!dialog) return null;

  switch (dialog.type) {
    case 'message':
      return <MessageBox {...dialog.props} />;
    case 'confirm':
      return <ConfirmDialog {...dialog.props} />;
    case 'input':
      return <InputDialog {...dialog.props} />;
    case 'progress':
      return <ProgressDialog {...dialog.props} />;
    default:
      return null;
  }
};

export default DialogManager;
