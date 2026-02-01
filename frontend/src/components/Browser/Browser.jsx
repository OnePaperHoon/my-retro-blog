import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Button, TextInput } from 'react95';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #c0c0c0;
`;

const MenuBar = styled.div`
  display: flex;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  font-size: 13px;
`;

const MenuItem = styled.div`
  padding: 4px 12px;
  cursor: pointer;
  &:hover {
    background: #000080;
    color: #fff;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #c0c0c0;
  border-bottom: 2px solid #808080;
`;

const ToolButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  background: transparent;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  font-size: 11px;
  min-width: 50px;

  &:hover:not(:disabled) {
    background: #e0e0e0;
  }

  &:active:not(:disabled) {
    background: #a0a0a0;
  }
`;

const ToolIcon = styled.span`
  font-size: 20px;
  margin-bottom: 2px;
`;

const AddressBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #c0c0c0;
  border-bottom: 2px solid #808080;
`;

const AddressLabel = styled.span`
  font-size: 12px;
  font-weight: bold;
`;

const AddressInput = styled.input`
  flex: 1;
  padding: 4px 8px;
  font-size: 13px;
  border: 2px inset #fff;
  font-family: 'MS Sans Serif', sans-serif;
`;

const Content = styled.div`
  flex: 1;
  background: #fff;
  overflow: hidden;
  position: relative;
`;

const IframeContainer = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  font-size: 12px;
`;

const StatusSection = styled.div`
  flex: 1;
  padding: 2px 8px;
  border: 1px inset #fff;
  background: #c0c0c0;
`;

const HomePage = styled.div`
  padding: 40px;
  text-align: center;
  font-family: 'MS Sans Serif', sans-serif;
`;

const HomeTitle = styled.h1`
  color: #000080;
  font-size: 28px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const HomeLogo = styled.span`
  font-size: 48px;
`;

const QuickLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
`;

const QuickLink = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  width: 120px;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    border: 2px outset #c0c0c0;
    background: #e0e0e0;
  }
`;

const LinkIcon = styled.span`
  font-size: 32px;
  margin-bottom: 8px;
`;

const LinkText = styled.span`
  font-size: 12px;
  text-align: center;
  color: #000080;
  text-decoration: underline;
`;

const SearchBox = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const ErrorPage = styled.div`
  padding: 40px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const Favorites = [
  { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '💻' },
];

const Browser = ({ showMessageBox }) => {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('about:home');
  const [inputUrl, setInputUrl] = useState('');
  const [history, setHistory] = useState(['about:home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Done');
  const iframeRef = useRef(null);

  const navigate = (newUrl) => {
    if (!newUrl || newUrl === currentUrl) return;

    // URL 정규화
    let normalizedUrl = newUrl;
    if (!newUrl.startsWith('http') && !newUrl.startsWith('about:')) {
      if (newUrl.includes('.')) {
        normalizedUrl = 'https://' + newUrl;
      } else {
        // 검색어로 처리
        normalizedUrl = `https://www.google.com/search?q=${encodeURIComponent(newUrl)}`;
      }
    }

    setIsLoading(true);
    setStatus('Opening page...');
    setCurrentUrl(normalizedUrl);
    setInputUrl(normalizedUrl);

    // 히스토리 업데이트
    const newHistory = [...history.slice(0, historyIndex + 1), normalizedUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setTimeout(() => {
      setIsLoading(false);
      setStatus('Done');
    }, 500);
  };

  const handleGo = () => {
    navigate(inputUrl);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGo();
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current && currentUrl !== 'about:home') {
      setIsLoading(true);
      setStatus('Refreshing...');
      iframeRef.current.src = currentUrl;
      setTimeout(() => {
        setIsLoading(false);
        setStatus('Done');
      }, 500);
    }
  };

  const handleHome = () => {
    navigate('about:home');
  };

  const handleStop = () => {
    setIsLoading(false);
    setStatus('Stopped');
  };

  const openExternal = (url) => {
    window.open(url, '_blank');
    showMessageBox?.(`Opening ${url} in a new tab.\n\n(Due to security restrictions, external sites open in a new browser tab)`, 'info', 'Internet Explorer');
  };

  const renderContent = () => {
    if (currentUrl === 'about:home') {
      return (
        <HomePage>
          <HomeTitle>
            <HomeLogo>🌐</HomeLogo>
            Internet Explorer
          </HomeTitle>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Welcome to Internet Explorer! Enter a URL above or click a link below.
          </p>

          <SearchBox>
            <AddressInput
              style={{ maxWidth: '400px' }}
              placeholder="Search the web..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(e.target.value);
                }
              }}
            />
            <Button onClick={() => {
              const searchInput = document.querySelector('input[placeholder="Search the web..."]');
              if (searchInput?.value) navigate(searchInput.value);
            }}>
              Search
            </Button>
          </SearchBox>

          <QuickLinks>
            {Favorites.map((fav, i) => (
              <QuickLink key={i} onClick={() => openExternal(fav.url)}>
                <LinkIcon>{fav.icon}</LinkIcon>
                <LinkText>{fav.name}</LinkText>
              </QuickLink>
            ))}
          </QuickLinks>

          <p style={{ marginTop: '40px', fontSize: '11px', color: '#999' }}>
            Note: Due to browser security (CORS), external websites will open in a new tab.
          </p>
        </HomePage>
      );
    }

    // 외부 URL인 경우
    return (
      <ErrorPage>
        <ErrorIcon>🌐</ErrorIcon>
        <h2>Opening External Website</h2>
        <p style={{ margin: '20px 0' }}>
          Due to browser security restrictions, this website will open in a new tab.
        </p>
        <p style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '10px', margin: '20px auto', maxWidth: '500px' }}>
          {currentUrl}
        </p>
        <Button onClick={() => openExternal(currentUrl)} primary>
          Open in New Tab
        </Button>
        <Button onClick={handleHome} style={{ marginLeft: '8px' }}>
          Go Home
        </Button>
      </ErrorPage>
    );
  };

  return (
    <Container>
      {/* 메뉴 바 */}
      <MenuBar>
        {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map(menu => (
          <MenuItem key={menu}>{menu}</MenuItem>
        ))}
      </MenuBar>

      {/* 툴바 */}
      <Toolbar>
        <ToolButton onClick={handleBack} disabled={historyIndex === 0}>
          <ToolIcon>⬅️</ToolIcon>
          Back
        </ToolButton>
        <ToolButton onClick={handleForward} disabled={historyIndex >= history.length - 1}>
          <ToolIcon>➡️</ToolIcon>
          Forward
        </ToolButton>
        <ToolButton onClick={handleStop}>
          <ToolIcon>⛔</ToolIcon>
          Stop
        </ToolButton>
        <ToolButton onClick={handleRefresh}>
          <ToolIcon>🔄</ToolIcon>
          Refresh
        </ToolButton>
        <ToolButton onClick={handleHome}>
          <ToolIcon>🏠</ToolIcon>
          Home
        </ToolButton>
        <div style={{ width: '1px', height: '40px', background: '#808080', margin: '0 8px' }} />
        <ToolButton onClick={() => showMessageBox?.('Search feature coming soon!', 'info', 'Search')}>
          <ToolIcon>🔍</ToolIcon>
          Search
        </ToolButton>
        <ToolButton onClick={() => showMessageBox?.('Favorites:\n\n' + Favorites.map(f => `• ${f.name}`).join('\n'), 'info', 'Favorites')}>
          <ToolIcon>⭐</ToolIcon>
          Favorites
        </ToolButton>
      </Toolbar>

      {/* 주소 표시줄 */}
      <AddressBar>
        <AddressLabel>Address</AddressLabel>
        <AddressInput
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a web address or search term"
        />
        <Button onClick={handleGo}>Go</Button>
      </AddressBar>

      {/* 콘텐츠 */}
      <Content>
        {renderContent()}
      </Content>

      {/* 상태 표시줄 */}
      <StatusBar>
        <StatusSection style={{ flex: 3 }}>
          {isLoading ? '🌐 ' : '✅ '}{status}
        </StatusSection>
        <StatusSection style={{ flex: 1, textAlign: 'center' }}>
          Internet
        </StatusSection>
      </StatusBar>
    </Container>
  );
};

export default Browser;
