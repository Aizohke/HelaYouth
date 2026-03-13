import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Attach Clerk token to every request
export const setupInterceptors = (getToken) => {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
    return config;
  });
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const syncUser = (data) => api.post('/auth/sync', data);
export const getMe = () => api.get('/auth/me');

// ─── Members ────────────────────────────────────────────────────────────────
export const getMyPortfolio = () => api.get('/members/me');
export const updateMyProfile = (data) => api.patch('/members/me', data);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminMembers = (params) => api.get('/admin/members', { params });
export const updateMemberStatus = (id, status) => api.patch(`/admin/members/${id}/status`, { status });
export const updateMemberRole = (id, role) => api.patch(`/admin/members/${id}/role`, { role });
export const getMemberContributions = (id) => api.get(`/contributions/member/${id}`);

// ─── Contributions ───────────────────────────────────────────────────────────
export const addContribution = (data) => api.post('/contributions', data);
export const deleteContribution = (id) => api.delete(`/contributions/${id}`);
export const getFundSummary = () => api.get('/contributions/summary');

// ─── Content ─────────────────────────────────────────────────────────────────
export const getProjects = () => api.get('/content/projects');
export const createProject = (data) => api.post('/content/projects', data);
export const updateProject = (id, data) => api.put(`/content/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/content/projects/${id}`);

export const getEvents = () => api.get('/content/events');
export const getAllEvents = () => api.get('/content/events/all');
export const createEvent = (data) => api.post('/content/events', data);
export const updateEvent = (id, data) => api.put(`/content/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/content/events/${id}`);

export const getSiteContent = (key) => api.get(`/content/site/${key}`);
export const updateSiteContent = (key, value) => api.put(`/content/site/${key}`, { value });

// ─── Articles ─────────────────────────────────────────────────────────────────
export const getArticles = (params) => api.get('/articles', { params });
export const getArticle = (slug) => api.get(`/articles/${slug}`);
export const createArticle = (data) => api.post('/articles', data);
export const updateArticle = (id, data) => api.put(`/articles/${id}`, data);
export const deleteArticle = (id) => api.delete(`/articles/${id}`);
export const likeArticle = (id) => api.post(`/articles/${id}/like`);

export default api;
