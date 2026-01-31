import { Button } from 'react95';

const StartButton = ({ isActive, onClick }) => {
  return (
    <Button
      onClick={onClick}
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
