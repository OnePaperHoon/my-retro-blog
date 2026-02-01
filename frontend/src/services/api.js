const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
let authToken = localStorage.getItem('authToken');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Base fetch wrapper
const fetchAPI = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  login: (username, password) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  verify: () => fetchAPI('/auth/verify'),

  setup: (username, password) =>
    fetchAPI('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => {
    setAuthToken(null);
    return Promise.resolve({ success: true });
  },
};

// Posts API
export const postsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/posts${query ? `?${query}` : ''}`);
  },

  getById: (id) => fetchAPI(`/posts/${id}`),

  create: (postData) =>
    fetchAPI('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),

  update: (id, postData) =>
    fetchAPI(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),

  delete: (id) =>
    fetchAPI(`/posts/${id}`, {
      method: 'DELETE',
    }),
};

// Projects API
export const projectsAPI = {
  getAll: (featured = false) =>
    fetchAPI(`/projects${featured ? '?featured=true' : ''}`),

  getById: (id) => fetchAPI(`/projects/${id}`),

  create: (projectData) =>
    fetchAPI('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  update: (id, projectData) =>
    fetchAPI(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  delete: (id) =>
    fetchAPI(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

// Files API
export const filesAPI = {
  getAll: (parentId = null) =>
    fetchAPI(`/files${parentId ? `?parentId=${parentId}` : ''}`),

  getTree: () => fetchAPI('/files/tree'),

  getById: (id) => fetchAPI(`/files/${id}`),

  create: (fileData) =>
    fetchAPI('/files', {
      method: 'POST',
      body: JSON.stringify(fileData),
    }),

  update: (id, fileData) =>
    fetchAPI(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fileData),
    }),

  delete: (id) =>
    fetchAPI(`/files/${id}`, {
      method: 'DELETE',
    }),
};

// Stats API
export const statsAPI = {
  recordVisit: (page, referrer) =>
    fetchAPI('/stats/visit', {
      method: 'POST',
      body: JSON.stringify({ page, referrer }),
    }),

  getStats: (period = '7d') => fetchAPI(`/stats?period=${period}`),
};

// Settings API
export const settingsAPI = {
  getAll: () => fetchAPI('/settings'),

  get: (key) => fetchAPI(`/settings/${key}`),

  update: (settings) =>
    fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  updateOne: (key, value) =>
    fetchAPI(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
};

export default {
  auth: authAPI,
  posts: postsAPI,
  projects: projectsAPI,
  files: filesAPI,
  stats: statsAPI,
  settings: settingsAPI,
};
