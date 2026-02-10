// API base URL - uses environment variable in production, proxy in development
const API_URL = import.meta.env.VITE_API_URL || '';

export { API_URL };
export const API = {
  // Auth
  login: (data) => fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  register: (data) => fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getMe: (token) => fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateProfile: (token, data) => fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  getUser: (username) => fetch(`${API_URL}/api/auth/users/${username}`),

  // Notes
  getPublicNotes: () => fetch(`${API_URL}/api/notes`),
  getMyNotes: (token) => fetch(`${API_URL}/api/notes/my-notes`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  createNote: (token, data) => fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  updateNote: (token, id, data) => fetch(`${API_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  deleteNote: (token, id) => fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }),
  getNoteBySlug: (slug) => fetch(`${API_URL}/api/notes/${slug}`),
  getNoteById: (token, id) => fetch(`${API_URL}/api/notes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),

  // Categories
  getMyCategories: (token) => fetch(`${API_URL}/api/categories/my-categories`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  createCategory: (token, data) => fetch(`${API_URL}/api/categories`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  getCategory: (slug) => fetch(`${API_URL}/api/categories/${slug}`),
  getCategoryNotes: (slug) => fetch(`${API_URL}/api/categories/${slug}/notes`),
  updateCategory: (token, id, data) => fetch(`${API_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  deleteCategory: (token, id) => fetch(`${API_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }),
  addNoteToCategory: (token, categoryId, noteId) => fetch(`${API_URL}/api/categories/${categoryId}/notes/${noteId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }),

  // Share
  generateShareLink: (token, noteId) => fetch(`${API_URL}/api/notes/${noteId}/share`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }),
  getSharedNote: (shareLink) => fetch(`${API_URL}/api/notes/shared/${shareLink}`)
};
