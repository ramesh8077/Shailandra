export const API_BASE = import.meta.env.VITE_API_BASE || '';
let csrf;
export async function api(path, options = {}) {
  const method = options.method || 'GET';
  if (method !== 'GET' && !csrf) {
    const response = await fetch(`${API_BASE}/api/auth/csrf`, {
      credentials: 'include',
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Could not establish a secure session');
    csrf = (await response.json()).csrf;
  }
  const form = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body && !form ? {
        'Content-Type': 'application/json'
      } : {}),
      ...(method !== 'GET' ? {
        'X-CSRF-Token': csrf
      } : {}),
      ...options.headers
    },
    body: options.body && !form ? JSON.stringify(options.body) : options.body
  });
  const data = await response.json().catch(() => ({
    error: {
      message: 'The CMS server is unavailable. Check the backend connection and try again.'
    }
  }));
  if (!response.ok) {
    if (response.status === 403) csrf = null;
    throw Object.assign(new Error(data.error?.message || 'Request failed'), {
      status: response.status
    });
  }
  if (data.csrf) csrf = data.csrf;
  if (path === '/auth/logout') csrf = null;
  return data;
}
export function mediaSrc(url) {
  return url?.startsWith('/api/') ? `${API_BASE}${url}` : url;
}
