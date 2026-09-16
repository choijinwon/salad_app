const env = import.meta.env as Record<string, string | undefined>;

function getDefaultBaseUrl() {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8080/api";
  }

  const { hostname, protocol } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:8080/api`;
  }

  return "/api";
}

export const API_BASE_URL =
  (env.VITE_API_BASE_URL ?? env.EXPO_PUBLIC_API_BASE_URL ?? getDefaultBaseUrl()).replace(/\/$/, "");

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("배포 환경의 백엔드 API 주소가 설정되지 않았습니다. Netlify 환경변수 VITE_API_BASE_URL에 백엔드 주소를 넣어주세요.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error(`백엔드 API에 연결할 수 없습니다. ${API_BASE_URL} 서버가 실행 중인지 확인해주세요.`);
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "API 요청에 실패했습니다.");
  }

  return body.data;
}
