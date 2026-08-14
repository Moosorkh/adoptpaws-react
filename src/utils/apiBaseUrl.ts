function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL;
  if (configured && configured.trim()) {
    return normalizeBaseUrl(configured.trim());
  }

  // In local development, call the local API directly.
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }

  // In production, default to same-origin API path.
  return '/api';
}
