const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export type ApiResponse<TData = Record<string, unknown>> = {
  success: boolean;
  message: string;
  data?: TData;
};

type ApiErrorDetail = string | { msg?: string; message?: string };

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;

  const errorData = data as {
    detail?: ApiErrorDetail | ApiErrorDetail[];
    message?: string;
  };

  if (typeof errorData.message === "string") return errorData.message;
  if (typeof errorData.detail === "string") return errorData.detail;

  if (Array.isArray(errorData.detail)) {
    return errorData.detail
      .map((detail) => {
        if (typeof detail === "string") return detail;
        return detail.msg || detail.message;
      })
      .filter(Boolean)
      .join(", ");
  }

  return fallback;
}

export async function apiRequest<TData>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<TData>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, "Request failed. Please try again."),
      response.status,
      data,
    );
  }

  return data as ApiResponse<TData>;
}

