

const API_URL = import.meta.env.VITE_API_URL;

let accessToken = localStorage.getItem('accessToken') || '';
let onUnauthorized = null;

export const setAccessToken = (token) => {
  accessToken = token || '';
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = () => accessToken;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const buildUrl = (path, query) => {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
};

export const apiRequest = async (path, options = {}) => {
  const { query, body, headers, retry = true, ...rest } = options;
  const response = await fetch(buildUrl(path, query), {
    credentials: 'include',
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401 && retry && path !== '/auth/refresh') {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest(path, { ...options, retry: false });
    }
  }

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    error.errors = payload.errors;
    throw error;
  }

  return payload.data;
};

export const refreshAccessToken = async () => {
  try {
    const data = await apiRequest('/auth/refresh', { method: 'POST', retry: false });
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    setAccessToken('');
    if (onUnauthorized) onUnauthorized();
    return null;
  }
};

export const api = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/users/me'),
  updateMe: (body) => apiRequest('/users/me', { method: 'PATCH', body }),
  getProfile: (username) => apiRequest(`/users/${username}`),
  follow: (profileId) => apiRequest(`/users/${profileId}/follow`, { method: 'POST' }),
  unfollow: (profileId) => apiRequest(`/users/${profileId}/follow`, { method: 'DELETE' }),
  homeFeed: (query) => apiRequest('/feed', { query }),
  exploreFeed: (query) => apiRequest('/feed/explore', { query }),
  createPost: (body) => apiRequest('/posts', { method: 'POST', body }),
  updatePost: (id, body) => apiRequest(`/posts/${id}`, { method: 'PATCH', body }),
  deletePost: (id) => apiRequest(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id) => apiRequest(`/posts/${id}/like`, { method: 'POST' }),
  unlikePost: (id) => apiRequest(`/posts/${id}/like`, { method: 'DELETE' }),
  repost: (id) => apiRequest(`/posts/${id}/repost`, { method: 'POST' }),
  userPosts: (profileId, query) => apiRequest(`/posts/user/${profileId}`, { query }),
  notifications: (query) => apiRequest('/notifications', { query }),
  unreadNotifications: () => apiRequest('/notifications/unread-count'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
  conversations: () => apiRequest('/chat/conversations'),
  createConversation: (body) => apiRequest('/chat/conversations', { method: 'POST', body }),
  messages: (conversationId, query) => apiRequest(`/chat/conversations/${conversationId}/messages`, { query }),
  sendMessage: (body) => apiRequest('/chat/messages', { method: 'POST', body }),
  markConversationRead: (conversationId) => apiRequest(`/chat/conversations/${conversationId}/read`, { method: 'PATCH' }),
};
