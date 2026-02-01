import { Button } from 'react95';
import soundManager from '../../utils/sounds';

const StartButton = ({ isActive, onClick }) => {
  const handleClick = () => {
    soundManager.menuOpen();
    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      active={isActive}
      style={{ fontWeight: 'bold' }}
    >
      <img
        src="https://win98icons.alexmeub.com/icons/png/windows-0.png"
        style={{ height: '18px', marginRight: '5px' }}
        alt="logo"
      />
      Start
    </Button>
  );
};

export default StartButton;
