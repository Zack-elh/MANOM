// Session-only auth — no token headers needed
export function authHeaders(): Record<string, string> {
  return {};
}
