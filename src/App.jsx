import React, { useState, useRef } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { 
  Window, WindowHeader, WindowContent, Button, 
  AppBar, Toolbar, MenuList, MenuListItem, Separator 
} from 'react95';
import original from 'react95/dist/themes/original';
import Draggable from 'react-draggable';

const GlobalStyles = createGlobalStyle`
  body {
    background-color: #008080; /* 바탕화면 진초록색 */
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'sans-serif';
  }
`;

function App() {
  const [open, setOpen] = useState(false); // 시작 메뉴 상태
  const nodeRef = useRef(null);

  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />

      {/* 1. 바탕화면 영역 */}
      <div style={{ height: '100vh', width: '100vw', padding: '20px' }}>
        
        <Draggable nodeRef={nodeRef} handle=".window-header">
          <div ref={nodeRef} style={{ width: '350px', position: 'absolute' }}>
            <Window style={{ width: '100%' }}>
              <WindowHeader className="window-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>My_Profile.exe</span>
                <Button size='sm' square>x</Button>
              </WindowHeader>
              <WindowContent>
                <p>윈도우 98 포트폴리오에 오신 것을 환영합니다!</p>
              </WindowContent>
            </Window>
          </div>
        </Draggable>

      </div>

      {/* 2. 하단 작업 표시줄 (Taskbar) */}
      <AppBar style={{ top: 'auto', bottom: 0 }}>
        <Toolbar style={{ justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* 시작 버튼 */}
            <Button
              onClick={() => setOpen(!open)}
              active={open}
              style={{ fontWeight: 'bold' }}
            >
              <img src="https://win98icons.alexmeub.com/icons/png/windows-0.png" style={{ height: '20px', marginRight: '4px' }} alt="win-logo" />
              Start
            </Button>

            {/* 시작 메뉴 (Start Menu) */}
            {open && (
              <MenuList
                style={{
                  position: 'absolute',
                  left: '0',
                  bottom: '100%',
                  zIndex: '9999'
                }}
                onClick={() => setOpen(false)}
              >
                <MenuListItem>📁 Documents</MenuListItem>
                <MenuListItem>💻 My Computer</MenuListItem>
                <Separator />
                <MenuListItem disabled>🔒 Logout</MenuListItem>
              </MenuList>
            )}
          </div>

          {/* 시계 영역 */}
          <div style={{ padding: '0 10px', border: '2px inset #ffffff', backgroundColor: '#c6c6c6', display: 'flex', alignItems: 'center' }}>
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default App;