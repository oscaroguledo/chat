const BASE = (import.meta.env.VITE_API_URL as string) || '';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  status?: string;
}

export interface AuthData {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<AuthData>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<AuthData>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken: string) =>
    request<null>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// ── Users ────────────────────────────────────────────────────────────────────

export const userApi = {
  me: () => request<AuthUser>('/api/users/me'),

  updateProfile: (data: { name?: string; bio?: string; status?: string }) =>
    request<AuthUser>('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const token = getToken();
    return fetch(`${BASE}/api/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(r => r.json()) as Promise<ApiResponse<AuthUser>>;
  },

  getUser: (userId: string) => request<AuthUser>(`/api/users/${userId}`),

  search: (q: string) =>
    request<AuthUser[]>(`/api/users/search?q=${encodeURIComponent(q)}`),
};

// ── Chats ────────────────────────────────────────────────────────────────────

export interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender?: AuthUser;
  type: string;
  content?: string;
  replyToId?: string;
  replyTo?: ChatMessage;
  edited: boolean;
  deleted: boolean;
  attachments: Attachment[];
  reactions: Reaction[];
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdBy?: AuthUser;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  list: () => request<Chat[]>('/api/chats'),

  get: (chatId: string) => request<Chat>(`/api/chats/${chatId}`),

  create: (data: { type: string; name?: string; description?: string; participantIds: string[] }) =>
    request<Chat>('/api/chats', { method: 'POST', body: JSON.stringify(data) }),

  delete: (chatId: string) =>
    request<null>(`/api/chats/${chatId}`, { method: 'DELETE' }),
};

// ── Messages ─────────────────────────────────────────────────────────────────

export const messageApi = {
  list: (chatId: string, page = 0, size = 50) =>
    request<PageResponse<ChatMessage>>(`/api/chats/${chatId}/messages?page=${page}&size=${size}`),

  send: (chatId: string, data: { type: string; content?: string; replyToId?: string }) =>
    request<ChatMessage>(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendFile: (chatId: string, file: File, type: string, content?: string, replyToId?: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    if (content) form.append('content', content);
    if (replyToId) form.append('replyToId', replyToId);
    const token = getToken();
    return fetch(`${BASE}/api/chats/${chatId}/messages/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(r => r.json()) as Promise<ApiResponse<ChatMessage>>;
  },

  edit: (chatId: string, messageId: string, content: string) =>
    request<ChatMessage>(`/api/chats/${chatId}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),

  delete: (chatId: string, messageId: string) =>
    request<null>(`/api/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' }),

  react: (chatId: string, messageId: string, emoji: string) =>
    request<null>(`/api/chats/${chatId}/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  markRead: (chatId: string) =>
    request<null>(`/api/chats/${chatId}/messages/read`, { method: 'POST' }),
};
