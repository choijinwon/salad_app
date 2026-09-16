const defaultBaseUrl = "http://localhost:8080/api";
const env = import.meta.env as Record<string, string | undefined>;

export const API_BASE_URL =
  (env.VITE_API_BASE_URL ?? env.EXPO_PUBLIC_API_BASE_URL ?? defaultBaseUrl).replace(/\/$/, "");

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "API 요청에 실패했습니다.");
  }

  return body.data;
}
