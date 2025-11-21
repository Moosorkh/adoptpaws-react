import { Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const REQUEST_TIMEOUT = 10000; // 10 seconds

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    throw error;
  }
}

async function fetchWithErrorHandling(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url, options);
    if (!response.ok) {
      throw new APIError(response.status, `HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/products`);
    const data = await response.json();
    // Transform backend data to match frontend Product type
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      description: item.description,
      imageUrl: item.image_url,
      category: item.category,
    }));
  },

  async getProduct(id: string): Promise<Product> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/products/${id}`);
    const item = await response.json();
    return {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      description: item.description,
      imageUrl: item.image_url,
      category: item.category,
    };
  },

  async getSettings(): Promise<Record<string, string>> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/settings`);
    return await response.json();
  },

  async getTeamMembers(): Promise<any[]> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/about/team`);
    return await response.json();
  },

  async getHistory(): Promise<any[]> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/about/history`);
    return await response.json();
  },

  async getCategories(): Promise<any[]> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/categories`);
    return await response.json();
  },

  async submitContact(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async submitAdoption(data: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    customer_address?: string;
    products: any[];
    total_amount: number;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/adoptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
};
