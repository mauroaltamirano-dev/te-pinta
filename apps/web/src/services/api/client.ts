const API_BASE_URL = "http://localhost:3001/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!res.ok) {
    if (isJson) {
      const errorBody = await res.json();
      throw new Error(errorBody.message || "Request failed");
    }

    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (isJson) {
    return res.json();
  }

  return undefined as T;
}

export const apiClient = {
  get: <T>(path: string, config?: { params?: Record<string, string | number | boolean | undefined> }) => {
    if (config?.params) {
      const filteredParams = Object.fromEntries(
        Object.entries(config.params).filter(([, v]) => v !== undefined)
      ) as Record<string, string>;
      const qs = new URLSearchParams(filteredParams).toString();
      if (qs) return request<T>(`${path}?${qs}`);
    }
    return request<T>(path);
  },

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};