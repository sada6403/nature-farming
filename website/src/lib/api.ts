// Website API Client - replaces Supabase client completely

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/aloe_soap_product_1776647089967.png';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${API_BASE_URL}${path}`;
  return path;
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Company Settings
  async getSettings() {
    try {
      const res: any = await fetchJson('/api/settings');
      return res.data || null;
    } catch {
      return null;
    }
  },

  // Products
  async getProducts(params?: { category?: string; featured?: boolean }) {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.featured) query.set('featured', 'true');
      const res: any = await fetchJson(`/api/products?${query.toString()}`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getProduct(idOrSlug: string) {
    const res: any = await fetchJson(`/api/products/${idOrSlug}`);
    return res.data || null;
  },

  // Categories
  async getCategories() {
    try {
      const res: any = await fetchJson('/api/categories');
      return res.data || [];
    } catch {
      return [];
    }
  },

  // Branches
  async getBranches() {
    try {
      const res: any = await fetchJson('/api/branches');
      return res.data || [];
    } catch {
      return [];
    }
  },

  // Gallery
  async getGallery(category?: string) {
    try {
      const query = category && category !== 'all' ? `?category=${category}` : '';
      const res: any = await fetchJson(`/api/gallery${query}`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  // Banners
  async getBanners() {
    try {
      const res: any = await fetchJson('/api/banners');
      return res.data || [];
    } catch {
      return [];
    }
  },

  // FAQs
  async getFaqs() {
    try {
      const res: any = await fetchJson('/api/faqs');
      return res.data || [];
    } catch {
      return [];
    }
  },

  // Inquiries submission
  async submitInquiry(data: {
    type: 'contact' | 'farmer_interest';
    full_name: string;
    email?: string;
    phone: string;
    subject?: string;
    message?: string;
    district?: string;
    assigned_branch_id?: string;
    website?: string;
  }) {
    return await fetchJson('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
