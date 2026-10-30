export const API_BASE = import.meta.env.VITE_API_BASE || '';
let csrf;

async function requestJson(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Cannot reach the CMS backend. Check that the CMS service is running and try again.');
  }

  if ([502, 503, 504].includes(response.status)) {
    throw Object.assign(new Error(
      `The CMS backend is currently unavailable (HTTP ${response.status}). The public website can still be viewed, but admin sign-in and content changes require the backend to be running.`
    ), {
      status: response.status
    });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The CMS backend returned an invalid response. Check the backend connection and try again.');
  }

  if (!response.ok) {
    if (response.status === 403) csrf = null;
    throw Object.assign(new Error(data.error?.message || 'The CMS request failed. Try again.'), {
      status: response.status
    });
  }
  return data;
}

export async function api(path, options = {}) {
  const method = options.method || 'GET';
  if (method !== 'GET' && !csrf) {
    const data = await requestJson(`${API_BASE}/api/auth/csrf`, {
      credentials: 'include',
      cache: 'no-store'
    });
    if (typeof data.csrf !== 'string' || !data.csrf) {
      throw new Error('The CMS backend did not provide a secure session token.');
    }
    csrf = data.csrf;
  }

  const form = options.body instanceof FormData;
  const data = await requestJson(`${API_BASE}/api${path}`, {
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

  if (path === '/auth/login' || path === '/auth/me') {
    if (!data.user || typeof data.user.name !== 'string' || typeof data.user.role !== 'string') {
      throw new Error('The CMS backend returned incomplete sign-in information.');
    }
  }
  if (data.csrf) csrf = data.csrf;
  if (path === '/auth/logout') csrf = null;
  return data;
}

export function mediaSrc(url) {
  if (url?.startsWith('/api/')) return `${API_BASE}${url}`;
  return url || '';
}
