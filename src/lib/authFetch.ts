const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    const auth = localStorage.getItem('manom_auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      return token || '';
    }
  } catch {}
  return '';
}

export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((v, k) => { headers[k] = v; });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([k, v]) => { headers[k] = v; });
    } else {
      Object.assign(headers, init.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
}
