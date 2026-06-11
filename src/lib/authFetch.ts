const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
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

  return fetch(`${API}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
}
