export function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const auth = localStorage.getItem('manom_auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      if (token) return { 'Authorization': `Bearer ${token}` };
    }
  } catch {}
  return {};
}
