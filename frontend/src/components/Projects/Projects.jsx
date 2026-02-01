import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, TextInput } from 'react95';
import { projectsAPI } from '../../services/api';
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
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fff;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const ProjectCard = styled.div`
  border: 2px outset #fff;
  background: #c0c0c0;
  padding: 12px;
  cursor: pointer;

  ${props => props.$selected && `
    border: 2px inset #fff;
    background: #000080;
    color: #fff;
  `}
`;

const ProjectTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProjectDescription = styled.p`
  font-size: 13px;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

const TechBadge = styled.span`
  background: ${props => props.$selected ? '#fff' : '#000080'};
  color: ${props => props.$selected ? '#000080' : '#fff'};
  padding: 2px 6px;
  font-size: 11px;
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;

  a {
    color: ${props => props.$selected ? '#ccc' : '#0000ff'};
  }
`;

const EditorOverlay = styled.div`
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

const EditorWindow = styled.div`
  background: #c0c0c0;
  border: 2px outset #fff;
  width: 450px;
  max-height: 90vh;
  overflow-y: auto;
`;

const EditorHeader = styled.div`
  background: linear-gradient(90deg, #000080, #1084d0);
  color: #fff;
  padding: 4px 8px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EditorContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
`;

const TextArea = styled.textarea`
  padding: 8px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 13px;
  border: 2px inset #fff;
  resize: vertical;
  min-height: 80px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #808080;
  font-size: 14px;
`;

const FeaturedBadge = styled.span`
  background: #ffd700;
  color: #000;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
`;

const Projects = ({ showMessageBox, showConfirm }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    techStack: '',
    imageUrl: '',
    githubUrl: '',
    demoUrl: '',
    featured: false,
    order: 0
  });

  // 프로젝트 목록 로드
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectsAPI.getAll();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // 새 프로젝트
  const handleNewProject = () => {
    setSelectedProject(null);
    setEditForm({
      title: '',
      description: '',
      techStack: '',
      imageUrl: '',
      githubUrl: '',
      demoUrl: '',
      featured: false,
      order: projects.length
    });
    setIsEditing(true);
  };

  // 프로젝트 수정
  const handleEditProject = () => {
    if (!selectedProject) return;
    setEditForm({
      title: selectedProject.title,
      description: selectedProject.description || '',
      techStack: selectedProject.techStack?.join(', ') || '',
      imageUrl: selectedProject.imageUrl || '',
      githubUrl: selectedProject.githubUrl || '',
      demoUrl: selectedProject.demoUrl || '',
      featured: selectedProject.featured || false,
      order: selectedProject.order || 0
    });
    setIsEditing(true);
  };

  // 프로젝트 저장
  const handleSaveProject = async () => {
    if (!editForm.title.trim()) {
      showMessageBox?.('Title is required.', 'warning', 'Validation Error');
      return;
    }

    try {
      const projectData = {
        ...editForm,
        techStack: editForm.techStack.split(',').map(t => t.trim()).filter(Boolean)
      };

      let response;
      if (selectedProject) {
        response = await projectsAPI.update(selectedProject._id, projectData);
      } else {
        response = await projectsAPI.create(projectData);
      }

      if (response.success) {
        showMessageBox?.('Project saved successfully!', 'info', 'Success');
        setIsEditing(false);
        setSelectedProject(null);
        loadProjects();
      }
    } catch (error) {
      showMessageBox?.(`Failed to save: ${error.message}`, 'error', 'Error');
    }
  };

  // 프로젝트 삭제
  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    const confirmed = await showConfirm?.(
      `Are you sure you want to delete "${selectedProject.title}"?`,
      { title: 'Confirm Delete' }
    );

    if (confirmed) {
      try {
        const response = await projectsAPI.delete(selectedProject._id);
        if (response.success) {
          showMessageBox?.('Project deleted.', 'info', 'Deleted');
          setSelectedProject(null);
          loadProjects();
        }
      } catch (error) {
        showMessageBox?.(`Failed to delete: ${error.message}`, 'error', 'Error');
      }
    }
  };

  return (
    <Container>
      <Toolbar>
        {isAuthenticated && (
          <>
            <Button onClick={handleNewProject}>New Project</Button>
            {selectedProject && (
              <>
                <Button onClick={handleEditProject}>Edit</Button>
                <Button onClick={handleDeleteProject}>Delete</Button>
              </>
            )}
          </>
        )}
        <Button onClick={loadProjects} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
          {projects.length} project(s) | Click to select
        </span>
      </Toolbar>

      <Content>
        {isLoading ? (
          <EmptyState>Loading projects...</EmptyState>
        ) : projects.length === 0 ? (
          <EmptyState>No projects yet. {isAuthenticated && 'Click "New Project" to add one.'}</EmptyState>
        ) : (
          <ProjectGrid>
            {projects.map(project => (
              <ProjectCard
                key={project._id}
                $selected={selectedProject?._id === project._id}
                onClick={() => setSelectedProject(
                  selectedProject?._id === project._id ? null : project
                )}
              >
                <ProjectTitle>
                  {project.featured && <FeaturedBadge>FEATURED</FeaturedBadge>}
                  {project.title}
                </ProjectTitle>
                <ProjectDescription>{project.description}</ProjectDescription>
                {project.techStack?.length > 0 && (
                  <TechStack>
                    {project.techStack.map((tech, i) => (
                      <TechBadge key={i} $selected={selectedProject?._id === project._id}>
                        {tech}
                      </TechBadge>
                    ))}
                  </TechStack>
                )}
                <ProjectLinks $selected={selectedProject?._id === project._id}>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                       onClick={e => e.stopPropagation()}>
                      GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                       onClick={e => e.stopPropagation()}>
                      Live Demo
                    </a>
                  )}
                </ProjectLinks>
              </ProjectCard>
            ))}
          </ProjectGrid>
        )}
      </Content>

      {/* 에디터 모달 */}
      {isEditing && (
        <EditorOverlay onClick={() => setIsEditing(false)}>
          <EditorWindow onClick={e => e.stopPropagation()}>
            <EditorHeader>
              <span>{selectedProject ? 'Edit Project' : 'New Project'}</span>
              <Button size="sm" onClick={() => setIsEditing(false)}>X</Button>
            </EditorHeader>
            <EditorContent>
              <InputGroup>
                <Label>Title: *</Label>
                <TextInput
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Project title"
                  fullWidth
                />
              </InputGroup>

              <InputGroup>
                <Label>Description:</Label>
                <TextArea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Project description"
                />
              </InputGroup>

              <InputGroup>
                <Label>Tech Stack (comma separated):</Label>
                <TextInput
                  value={editForm.techStack}
                  onChange={e => setEditForm({ ...editForm, techStack: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                  fullWidth
                />
              </InputGroup>

              <InputGroup>
                <Label>GitHub URL:</Label>
                <TextInput
                  value={editForm.githubUrl}
                  onChange={e => setEditForm({ ...editForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  fullWidth
                />
              </InputGroup>

              <InputGroup>
                <Label>Demo URL:</Label>
                <TextInput
                  value={editForm.demoUrl}
                  onChange={e => setEditForm({ ...editForm, demoUrl: e.target.value })}
                  placeholder="https://..."
                  fullWidth
                />
              </InputGroup>

              <InputGroup>
                <Label>Image URL:</Label>
                <TextInput
                  value={editForm.imageUrl}
                  onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  fullWidth
                />
              </InputGroup>

              <InputGroup style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={editForm.featured}
                  onChange={e => setEditForm({ ...editForm, featured: e.target.checked })}
                />
                <Label htmlFor="featured" style={{ fontWeight: 'normal' }}>Featured project</Label>
              </InputGroup>

              <ButtonGroup>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveProject} primary>Save</Button>
              </ButtonGroup>
            </EditorContent>
          </EditorWindow>
        </EditorOverlay>
      )}
    </Container>
  );
};

export default Projects;
