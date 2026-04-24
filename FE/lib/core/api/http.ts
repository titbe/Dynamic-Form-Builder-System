import { ApiError, ApiSuccess } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/";
const TOKEN_KEY = "fms_access_token";

export class HttpError extends Error {
  public readonly code: string;
  public readonly details: unknown;

  constructor(message: string, code = "HTTP_ERROR", details: unknown = null) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const authTokenStorage = {
  get() {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(TOKEN_KEY) ?? "";
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  }
};

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
};

const buildUrl = (path: string, params?: RequestOptions["params"]) => {
  const url = new URL(path, API_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

export const http = async <T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>> => {
  const token = authTokenStorage.get();
  const response = await fetch(buildUrl(path, options?.params), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {})
    },
    cache: "no-store"
  });

  const json = (await response.json()) as ApiSuccess<T> | ApiError;
  if (!response.ok || !json.success) {
    const error = (json as ApiError).error;
    throw new HttpError(error?.message ?? "Request failed", error?.code, error?.details);
  }

  return json as ApiSuccess<T>;
};
