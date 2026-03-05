const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export type RequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

async function buildUrl(path: string, params?: RequestConfig['params']): Promise<string> {
  const base = getBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(`${base}/${normalizedPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestConfig = {}
): Promise<T> {
  const { params, ...init } = options;
  const url = await buildUrl(path, params);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };
  const token = import.meta.env.VITE_API_TOKEN;
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...init, headers, credentials: init.credentials ?? 'include' });
  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const json = JSON.parse(body);
      message = json.message ?? json.error ?? body;
    } catch {
      message = res.statusText || body;
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

export const api = {
  get: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'GET' }),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'DELETE' }),
};
