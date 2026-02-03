import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Button, TextInput } from 'react95';
import ReactMarkdown from 'react-markdown';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #c0c0c0;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 2px solid #808080;
  flex-wrap: wrap;
  align-items: center;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 160px;
  border-right: 2px solid #808080;
  display: flex;
  flex-direction: column;
  background: #c0c0c0;
`;

const SidebarSection = styled.div`
  border-bottom: 1px solid #808080;
`;

const SidebarTitle = styled.div`
  padding: 8px;
  font-weight: bold;
  font-size: 12px;
  background: linear-gradient(180deg, #000080, #1084d0);
  color: #fff;
`;

const CategoryList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
`;

const CategoryItem = styled.div`
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$selected ? '#000080' : 'transparent'};
  color: ${props => props.$selected ? '#fff' : '#000'};

  &:hover {
    background: ${props => props.$selected ? '#000080' : '#e0e0e0'};
  }
`;

const CategoryCount = styled.span`
  font-size: 10px;
  background: ${props => props.$selected ? '#fff' : '#808080'};
  color: ${props => props.$selected ? '#000080' : '#fff'};
  padding: 1px 5px;
  border-radius: 8px;
`;

const PostList = styled.div`
  width: 260px;
  border-right: 2px solid #808080;
  overflow-y: auto;
  background: #fff;
`;

const PostItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #c0c0c0;
  cursor: pointer;
  background: ${props => props.$selected ? '#000080' : 'transparent'};
  color: ${props => props.$selected ? '#fff' : '#000'};

  &:hover {
    background: ${props => props.$selected ? '#000080' : '#e0e0e0'};
  }
`;

const PostTitle = styled.div`
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
`;

const PostMeta = styled.div`
  font-size: 11px;
  color: ${props => props.$selected ? '#ccc' : '#666'};
`;

const PostView = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fff;
`;

const PostContent = styled.div`
  line-height: 1.6;

  h1 { font-size: 24px; margin: 20px 0 12px 0; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
  h2 { font-size: 20px; margin: 18px 0 10px 0; }
  h3 { font-size: 16px; margin: 16px 0 8px 0; }
  p { margin: 10px 0; }

  code {
    background: #f4f4f4;
    padding: 2px 6px;
    font-family: 'Courier New', Consolas, monospace;
    font-size: 13px;
    border-radius: 3px;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: transparent;
      padding: 0;
      color: inherit;
    }
  }

  blockquote {
    border-left: 4px solid #000080;
    margin: 12px 0;
    padding: 8px 16px;
    background: #f0f0f0;
    color: #333;
  }

  ul, ol {
    margin: 10px 0;
    padding-left: 24px;
  }

  li { margin: 4px 0; }

  a {
    color: #000080;
    text-decoration: underline;
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 12px 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }

  th {
    background: #f0f0f0;
    font-weight: bold;
  }

  hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 16px 0;
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  overflow-y: auto;
  background: #fff;
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 200px;
  padding: 8px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 13px;
  border: 2px inset #fff;
  resize: none;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #808080;
  font-size: 14px;
`;

const CategorySelect = styled.select`
  padding: 4px 8px;
  font-size: 13px;
  border: 2px inset #fff;
  background: #fff;
  font-family: 'MS Sans Serif', sans-serif;
`;

const AddCategoryInput = styled.div`
  display: flex;
  padding: 4px;
  gap: 4px;
  background: #e0e0e0;
`;

const SmallInput = styled.input`
  flex: 1;
  padding: 2px 4px;
  font-size: 11px;
  border: 1px inset #fff;
`;

const SmallButton = styled.button`
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
`;

const Blog = ({ showMessageBox, showConfirm, showInput }) => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('blogCategories');
    return saved ? JSON.parse(saved) : ['General', 'Tech', 'Life', 'Tutorial'];
  });
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'General',
    tags: '',
    isPublished: true
  });

  // 카테고리 저장
  useEffect(() => {
    localStorage.setItem('blogCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  // 카테고리별 글 수 계산
  const categoryCounts = useMemo(() => {
    const counts = { All: posts.length };
    posts.forEach(post => {
      const cat = post.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // 필터링된 포스트
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return posts;
    return posts.filter(post => (post.category || 'General') === selectedCategory);
  }, [posts, selectedCategory]);

  // 모든 카테고리 (기본 + posts에서 추출)
  const allCategories = useMemo(() => {
    const fromPosts = [...new Set(posts.map(p => p.category || 'General'))];
    const combined = [...new Set([...customCategories, ...fromPosts])];
    return combined.sort();
  }, [posts, customCategories]);

  // 포스트 목록 로드
  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postsAPI.getAll({ limit: 50 });
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // 포스트 선택
  const handleSelectPost = async (post) => {
    try {
      const response = await postsAPI.getById(post._id);
      if (response.success) {
        setSelectedPost(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      showMessageBox?.(`Failed to load post: ${error.message}`, 'error', 'Error');
    }
  };

  // 새 글 작성
  const handleNewPost = () => {
    setSelectedPost(null);
    setIsEditing(true);
    setEditForm({
      title: '',
      content: '',
      summary: '',
      category: selectedCategory === 'All' ? 'General' : selectedCategory,
      tags: '',
      isPublished: true
    });
  };

  // 글 수정
  const handleEditPost = () => {
    if (!selectedPost) return;
    setIsEditing(true);
    setEditForm({
      title: selectedPost.title,
      content: selectedPost.content,
      summary: selectedPost.summary || '',
      category: selectedPost.category || 'General',
      tags: selectedPost.tags?.join(', ') || '',
      isPublished: selectedPost.isPublished
    });
  };

  // 글 저장
  const handleSavePost = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      showMessageBox?.('Title and content are required.', 'warning', 'Validation Error');
      return;
    }

    try {
      const postData = {
        ...editForm,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      let response;
      if (selectedPost) {
        response = await postsAPI.update(selectedPost._id, postData);
      } else {
        response = await postsAPI.create(postData);
      }

      if (response.success) {
        showMessageBox?.('Post saved successfully!', 'info', 'Success');
        setIsEditing(false);
        loadPosts();
        if (response.data) {
          setSelectedPost(response.data);
        }
      }
    } catch (error) {
      showMessageBox?.(`Failed to save: ${error.message}`, 'error', 'Error');
    }
  };

  // 글 삭제
  const handleDeletePost = async () => {
    if (!selectedPost) return;

    const confirmed = await showConfirm?.(
      `Are you sure you want to delete "${selectedPost.title}"?`,
      { title: 'Confirm Delete' }
    );

    if (confirmed) {
      try {
        const response = await postsAPI.delete(selectedPost._id);
        if (response.success) {
          showMessageBox?.('Post deleted.', 'info', 'Deleted');
          setSelectedPost(null);
          loadPosts();
        }
      } catch (error) {
        showMessageBox?.(`Failed to delete: ${error.message}`, 'error', 'Error');
      }
    }
  };

  // 취소
  const handleCancel = () => {
    setIsEditing(false);
    if (!selectedPost) {
      setEditForm({ title: '', content: '', summary: '', category: 'General', tags: '', isPublished: true });
    }
  };

  // 카테고리 추가
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (name && !customCategories.includes(name)) {
      setCustomCategories([...customCategories, name]);
      setNewCategoryName('');
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (category) => {
    if (category === 'General') {
      showMessageBox?.('Cannot delete the General category.', 'warning', 'Warning');
      return;
    }
    const confirmed = await showConfirm?.(`Delete category "${category}"?`, { title: 'Delete Category' });
    if (confirmed) {
      setCustomCategories(customCategories.filter(c => c !== category));
      if (selectedCategory === category) {
        setSelectedCategory('All');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <Toolbar>
        {isAuthenticated && (
          <>
            <Button onClick={handleNewPost} disabled={isEditing}>
              New Post
            </Button>
            {selectedPost && !isEditing && (
              <>
                <Button onClick={handleEditPost}>Edit</Button>
                <Button onClick={handleDeletePost}>Delete</Button>
              </>
            )}
            {isEditing && (
              <>
                <Button onClick={handleSavePost} primary>Save</Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </>
            )}
          </>
        )}
        <Button onClick={loadPosts} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>
          {filteredPosts.length} post(s) {selectedCategory !== 'All' && `in ${selectedCategory}`}
        </span>
      </Toolbar>

      <Content>
        {/* 카테고리 사이드바 */}
        <Sidebar>
          <SidebarSection>
            <SidebarTitle>Categories</SidebarTitle>
            <CategoryList>
              <CategoryItem
                $selected={selectedCategory === 'All'}
                onClick={() => setSelectedCategory('All')}
              >
                <span>All Posts</span>
                <CategoryCount $selected={selectedCategory === 'All'}>{categoryCounts.All || 0}</CategoryCount>
              </CategoryItem>
              {allCategories.map(cat => (
                <CategoryItem
                  key={cat}
                  $selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (isAuthenticated) handleDeleteCategory(cat);
                  }}
                >
                  <span>{cat}</span>
                  <CategoryCount $selected={selectedCategory === cat}>{categoryCounts[cat] || 0}</CategoryCount>
                </CategoryItem>
              ))}
            </CategoryList>
            {isAuthenticated && (
              <AddCategoryInput>
                <SmallInput
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <SmallButton onClick={handleAddCategory}>+</SmallButton>
              </AddCategoryInput>
            )}
          </SidebarSection>
        </Sidebar>

        {/* 글 목록 */}
        <PostList>
          {isLoading ? (
            <EmptyState>Loading...</EmptyState>
          ) : filteredPosts.length === 0 ? (
            <EmptyState>No posts</EmptyState>
          ) : (
            filteredPosts.map(post => (
              <PostItem
                key={post._id}
                $selected={selectedPost?._id === post._id}
                onClick={() => handleSelectPost(post)}
              >
                <PostTitle>{post.title}</PostTitle>
                <PostMeta $selected={selectedPost?._id === post._id}>
                  {formatDate(post.createdAt)} | {post.views} views
                </PostMeta>
              </PostItem>
            ))
          )}
        </PostList>

        {/* 글 보기/편집 */}
        {isEditing ? (
          <EditorContainer>
            <InputGroup>
              <Label>Title:</Label>
              <TextInput
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Post title"
                fullWidth
              />
            </InputGroup>

            <InputGroup>
              <Label>Summary:</Label>
              <TextInput
                value={editForm.summary}
                onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                placeholder="Brief summary"
                fullWidth
              />
            </InputGroup>

            <InputGroup style={{ flexDirection: 'row', gap: '16px' }}>
              <InputGroup style={{ flex: 1 }}>
                <Label>Category:</Label>
                <CategorySelect
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </CategorySelect>
              </InputGroup>
              <InputGroup style={{ flex: 1 }}>
                <Label>Tags (comma separated):</Label>
                <TextInput
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  fullWidth
                />
              </InputGroup>
            </InputGroup>

            <InputGroup style={{ flex: 1 }}>
              <Label>Content (Markdown supported):</Label>
              <TextArea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="Write your post content here..."
              />
            </InputGroup>
          </EditorContainer>
        ) : (
          <PostView>
            {selectedPost ? (
              <>
                <h1 style={{ margin: '0 0 8px 0' }}>{selectedPost.title}</h1>
                <PostMeta style={{ marginBottom: '16px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
                  {formatDate(selectedPost.createdAt)} | {selectedPost.category || 'General'} | {selectedPost.views} views
                  {selectedPost.tags?.length > 0 && (
                    <span> | Tags: {selectedPost.tags.join(', ')}</span>
                  )}
                </PostMeta>
                <PostContent>
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </PostContent>
              </>
            ) : (
              <EmptyState>Select a post to read</EmptyState>
            )}
          </PostView>
        )}
      </Content>
    </Container>
  );
};

export default Blog;
