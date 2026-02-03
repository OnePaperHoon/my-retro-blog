// 가상 파일 시스템 - 포트폴리오 프로젝트 구조

// Desktop 폴더 (localStorage와 연동)
const DESKTOP_FOLDERS_KEY = 'desktop_folders';

export const getDesktopFolders = () => {
  try {
    const saved = localStorage.getItem(DESKTOP_FOLDERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load desktop folders:', e);
  }
  return [];
};

export const saveDesktopFolder = (folder) => {
  const folders = getDesktopFolders();
  folders.push(folder);
  localStorage.setItem(DESKTOP_FOLDERS_KEY, JSON.stringify(folders));
};

export const removeDesktopFolder = (folderId) => {
  const folders = getDesktopFolders().filter(f => f.id !== folderId);
  localStorage.setItem(DESKTOP_FOLDERS_KEY, JSON.stringify(folders));
};

export const fileSystem = {
  id: 'root',
  name: 'My Computer',
  type: 'folder',
  path: 'C:',
  children: [
    {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder',
      path: 'C:\\Desktop',
      icon: '🖥️',
      children: [] // 동적으로 Desktop 아이콘에서 로드
    },
    {
      id: 'my-documents',
      name: 'My Documents',
      type: 'folder',
      path: 'C:\\My Documents',
      icon: '📁',
      children: [
        {
          id: 'projects',
          name: 'Projects',
          type: 'folder',
          path: 'C:\\My Documents\\Projects',
          icon: '💼',
          children: [
            {
              id: 'backend',
              name: 'Backend Projects',
              type: 'folder',
              path: 'C:\\My Documents\\Projects\\Backend Projects',
              icon: '🔧',
              children: [
                {
                  id: 'api-server',
                  name: 'REST API Server',
                  type: 'folder',
                  path: 'C:\\My Documents\\Projects\\Backend Projects\\REST API Server',
                  icon: '🌐',
                  children: [
                    {
                      id: 'api-readme',
                      name: 'README.md',
                      type: 'file',
                      size: '4.2 KB',
                      modified: '2025-01-25',
                      content: '# REST API Server\n\nNode.js + Express 기반 RESTful API 서버\n\n## 기술 스택\n- Node.js\n- Express\n- MongoDB\n- JWT Authentication'
                    },
                    {
                      id: 'api-package',
                      name: 'package.json',
                      type: 'file',
                      size: '1.8 KB',
                      modified: '2025-01-20'
                    }
                  ]
                },
                {
                  id: 'chat-server',
                  name: 'Real-time Chat Server',
                  type: 'folder',
                  path: 'C:\\My Documents\\Projects\\Backend Projects\\Real-time Chat Server',
                  icon: '💬',
                  children: [
                    {
                      id: 'chat-readme',
                      name: 'README.md',
                      type: 'file',
                      size: '3.5 KB',
                      modified: '2025-01-15',
                      content: '# Real-time Chat Server\n\nSocket.io 기반 실시간 채팅 서버\n\n## 기능\n- 실시간 메시지\n- 채팅방 생성\n- 파일 공유'
                    }
                  ]
                }
              ]
            },
            {
              id: 'frontend',
              name: 'Frontend Projects',
              type: 'folder',
              path: 'C:\\My Documents\\Projects\\Frontend Projects',
              icon: '🎨',
              children: [
                {
                  id: 'portfolio',
                  name: 'Portfolio Website',
                  type: 'folder',
                  path: 'C:\\My Documents\\Projects\\Frontend Projects\\Portfolio Website',
                  icon: '🌟',
                  children: [
                    {
                      id: 'portfolio-readme',
                      name: 'README.md',
                      type: 'file',
                      size: '2.1 KB',
                      modified: '2025-01-30',
                      content: '# Portfolio Website\n\nReact 기반 개인 포트폴리오\n\n## 기술 스택\n- React\n- TypeScript\n- Styled Components'
                    },
                    {
                      id: 'portfolio-demo',
                      name: 'DEMO.url',
                      type: 'file',
                      size: '156 B',
                      modified: '2025-01-30'
                    }
                  ]
                },
                {
                  id: 'dashboard',
                  name: 'Admin Dashboard',
                  type: 'folder',
                  path: 'C:\\My Documents\\Projects\\Frontend Projects\\Admin Dashboard',
                  icon: '📊',
                  children: [
                    {
                      id: 'dashboard-readme',
                      name: 'README.md',
                      type: 'file',
                      size: '3.8 KB',
                      modified: '2025-01-10',
                      content: '# Admin Dashboard\n\n관리자 대시보드 UI\n\n## 기능\n- 데이터 시각화\n- 사용자 관리\n- 통계 차트'
                    }
                  ]
                }
              ]
            },
            {
              id: 'fullstack',
              name: 'Full Stack Projects',
              type: 'folder',
              path: 'C:\\My Documents\\Projects\\Full Stack Projects',
              icon: '🚀',
              children: [
                {
                  id: 'ecommerce',
                  name: 'E-Commerce Platform',
                  type: 'folder',
                  path: 'C:\\My Documents\\Projects\\Full Stack Projects\\E-Commerce Platform',
                  icon: '🛒',
                  children: [
                    {
                      id: 'ecommerce-readme',
                      name: 'README.md',
                      type: 'file',
                      size: '5.6 KB',
                      modified: '2025-01-05',
                      content: '# E-Commerce Platform\n\n풀스택 쇼핑몰 프로젝트\n\n## 기술 스택\n- Frontend: React + Redux\n- Backend: Node.js + Express\n- Database: PostgreSQL\n- Payment: Stripe API'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'blog',
          name: 'Blog',
          type: 'folder',
          path: 'C:\\My Documents\\Blog',
          icon: '📝',
          children: [
            {
              id: 'blog-post-1',
              name: '2025-01-31-windows98-clone.md',
              type: 'file',
              size: '12.4 KB',
              modified: '2025-01-31',
              content: '# Windows 98 클론 프로젝트\n\nReact로 Windows 98 UI를 재현하는 프로젝트를 진행했습니다...'
            },
            {
              id: 'blog-post-2',
              name: '2025-01-20-react-hooks.md',
              type: 'file',
              size: '8.2 KB',
              modified: '2025-01-20'
            }
          ]
        },
        {
          id: 'resume',
          name: 'Resume',
          type: 'folder',
          path: 'C:\\My Documents\\Resume',
          icon: '📄',
          children: [
            {
              id: 'resume-en',
              name: 'Resume_EN.pdf',
              type: 'file',
              size: '245 KB',
              modified: '2025-01-28'
            },
            {
              id: 'resume-ko',
              name: 'Resume_KO.pdf',
              type: 'file',
              size: '238 KB',
              modified: '2025-01-28'
            }
          ]
        }
      ]
    }
  ]
};

// 경로로 노드 찾기
export const findNodeByPath = (path, node = fileSystem) => {
  if (node.path === path) return node;

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByPath(path, child);
      if (found) return found;
    }
  }

  return null;
};

// ID로 노드 찾기
export const findNodeById = (id, node = fileSystem) => {
  if (node.id === id) return node;

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(id, child);
      if (found) return found;
    }
  }

  return null;
};
