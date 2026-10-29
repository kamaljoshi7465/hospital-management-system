const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const TOKEN_KEY = "medicare_access_token_v1";
export const getAccessToken = () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setAccessToken = (token: string | null) => { try { if (token) sessionStorage.setItem(TOKEN_KEY, token); else sessionStorage.removeItem(TOKEN_KEY); } catch { /* session storage may be unavailable */ } };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = "ApiError"; this.status = status; }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError("Unable to reach the hospital server. Check that the backend is running.", 0);
  }
  if (!response.ok) {
    if (response.status === 401 && !path.endsWith("/auth/login") && !path.endsWith("/auth/signup")) window.dispatchEvent(new Event("hospital:unauthorized"));
    let message = response.statusText || "Request failed";
    try {
      const body = await response.json();
      const fieldErrors = body.details?.fieldErrors;
      const validationMessages = fieldErrors && typeof fieldErrors === "object" ? Object.entries(fieldErrors).map(([field, detail]) => `${field}: ${detail}`).join("; ") : "";
      message = validationMessages || body.message || body.error || (Array.isArray(body.errors) ? body.errors.join(", ") : message);
    } catch { /* response body may be empty */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
export const put = <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) });
export const patch = <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const del = <T = void>(path: string) => request<T>(path, { method: "DELETE" });
