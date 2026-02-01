import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Window,
  WindowHeader,
  WindowContent,
  Button,
  TextInput,
  Fieldset,
} from 'react95';
import { useAuth } from '../../contexts/AuthContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const StyledWindow = styled(Window)`
  width: 350px;
`;

const Header = styled(WindowHeader)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled(Button)`
  margin-right: -3px;
  margin-top: 1px;
`;

const Content = styled(WindowContent)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const IconSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`;

const KeyIcon = styled.div`
  font-size: 48px;
`;

const WelcomeText = styled.div`
  font-size: 14px;
  line-height: 1.4;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  font-size: 12px;
  background: #fff0f0;
  padding: 8px;
  border: 1px solid #ff0000;
`;

const LoginDialog = ({ onClose }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(username, password);
      if (response.success) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Overlay onClick={onClose}>
      <StyledWindow onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <Header>
          <span>Administrator Login</span>
          <CloseButton size="sm" onClick={onClose}>
            <span style={{ fontWeight: 'bold' }}>X</span>
          </CloseButton>
        </Header>
        <Content>
          <IconSection>
            <KeyIcon>🔐</KeyIcon>
            <WelcomeText>
              Enter your administrator credentials to access admin features.
            </WelcomeText>
          </IconSection>

          <form onSubmit={handleSubmit}>
            <Fieldset label="Credentials">
              <InputGroup>
                <Label htmlFor="username">Username:</Label>
                <TextInput
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  fullWidth
                  disabled={isLoading}
                  autoFocus
                />
              </InputGroup>

              <InputGroup style={{ marginTop: 12 }}>
                <Label htmlFor="password">Password:</Label>
                <TextInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  fullWidth
                  disabled={isLoading}
                />
              </InputGroup>
            </Fieldset>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonGroup>
              <Button type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                primary
              >
                {isLoading ? 'Logging in...' : 'OK'}
              </Button>
            </ButtonGroup>
          </form>
        </Content>
      </StyledWindow>
    </Overlay>
  );
};

export default LoginDialog;
