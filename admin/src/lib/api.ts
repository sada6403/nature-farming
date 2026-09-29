// Admin API Client - Replaces Supabase Client completely

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'nature_farming_admin_token';

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${API_BASE_URL}${path}`;
  return path;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `Request failed with status ${res.status}`;
    // If unauthorized, token is invalid or expired
    if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      removeToken();
      window.location.href = '/login';
    }
    throw new Error(errorMsg);
  }

  return data;
}

export const adminApi = {
  // Authentication
  async login(email: string, password: string) {
    const res: any = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      setToken(res.token);
    }
    return res;
  },

  async logout() {
    removeToken();
  },

  async getMe() {
    const token = getToken();
    if (!token) return null;
    try {
      const res: any = await request('/api/auth/me');
      return res.user || null;
    } catch {
      removeToken();
      return null;
    }
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res: any = await request('/api/stats/dashboard');
    return res.data;
  },

  async getSystemStatus() {
    const res: any = await request('/api/stats/system-status');
    return res.data;
  },

  // Products
  async getProducts() {
    const res: any = await request('/api/products?all=true');
    return res.data || [];
  },

  async createProduct(payload: any) {
    const res: any = await request('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateProduct(id: string, payload: any) {
    const res: any = await request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteProduct(id: string) {
    return await request(`/api/products/${id}`, { method: 'DELETE' });
  },

  // Categories
  async getCategories() {
    const res: any = await request('/api/categories');
    return res.data || [];
  },

  async createCategory(payload: { name: string; slug?: string }) {
    const res: any = await request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Branches
  async getBranches() {
    const res: any = await request('/api/branches?all=true');
    return res.data || [];
  },

  async createBranch(payload: any) {
    const res: any = await request('/api/branches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateBranch(id: string, payload: any) {
    const res: any = await request(`/api/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteBranch(id: string) {
    return await request(`/api/branches/${id}`, { method: 'DELETE' });
  },

  // Inquiries
  async getInquiries(params?: { type?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'all') query.set('type', params.type);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    const res: any = await request(`/api/inquiries?${query.toString()}`);
    return res.data || [];
  },

  async updateInquiry(id: string, payload: { status?: string; admin_notes?: string; assigned_branch_id?: string | null }) {
    const res: any = await request(`/api/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteInquiry(id: string) {
    return await request(`/api/inquiries/${id}`, { method: 'DELETE' });
  },

  async sendManagerEmail(inquiryId: string, branchId: string) {
    return await request(`/api/inquiries/${inquiryId}/email`, {
      method: 'POST',
      body: JSON.stringify({ branchId }),
    });
  },

  // Gallery
  async getGallery(category?: string) {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    const res: any = await request(`/api/gallery${query}`);
    return res.data || [];
  },

  async createGalleryItem(payload: { title: string; image_url: string; category: string; display_order?: number }) {
    const res: any = await request('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateGalleryItem(id: string, payload: any) {
    const res: any = await request(`/api/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteGalleryItem(id: string) {
    return await request(`/api/gallery/${id}`, { method: 'DELETE' });
  },

  // Promotional Banners
  async getBanners() {
    const res: any = await request('/api/banners?all=true');
    return res.data || [];
  },

  async createBanner(payload: any) {
    const res: any = await request('/api/banners', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateBanner(id: string, payload: any) {
    const res: any = await request(`/api/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteBanner(id: string) {
    return await request(`/api/banners/${id}`, { method: 'DELETE' });
  },

  // Settings
  async getSettings() {
    const res: any = await request('/api/settings');
    return res.data;
  },

  async updateSettings(payload: any) {
    const res: any = await request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // File Upload
  async uploadImage(file: File): Promise<{ url: string; relativeUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res: any = await request('/api/upload', {
      method: 'POST',
      body: formData,
    });

    return res;
  },

  async deleteUploadedFile(filename: string) {
    return await request(`/api/upload/${filename}`, { method: 'DELETE' });
  },
};
