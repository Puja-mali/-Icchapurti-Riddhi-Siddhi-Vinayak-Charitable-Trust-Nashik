/**
 * Siddhivinayak Charitable Trust - Unified API Client
 *
 * Configured via environment variable VITE_API_URL.
 * Supports credentials (HttpOnly cookies for secure refresh tokens),
 * automatic short-lived in-memory access token injection,
 * and transparent 401 token refresh retry.
 */

const normalizeBaseUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '/api';
  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
};

export const API_BASE_URL = normalizeBaseUrl(
  (import.meta as any).env?.VITE_API_URL || '/api'
);

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
}

export class ApiError extends Error {
  public status: number;
  public errors?: Array<{ field?: string; message: string }>;

  constructor(message: string, status: number = 500, errors?: Array<{ field?: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// In-memory access token storage (never written to localStorage)
let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
type RefreshCallback = (err: Error | null, token: string | null) => void;
let refreshSubscribers: RefreshCallback[] = [];

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(null, newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (err?: Error) => {
  const failureError = err || new ApiError('Session expired. Please sign in again.', 401);
  refreshSubscribers.forEach((cb) => {
    try {
      cb(failureError, null);
    } catch {
      // Ignore
    }
  });
  refreshSubscribers = [];
  inMemoryAccessToken = null;
};

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject in-memory access token
  if (!options.skipAuth && inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  // Always include credentials to securely transmit HttpOnly refresh cookies
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, fetchOptions);

    // Handle 401 Token Expiration with Automatic Silent Refresh
    const hasActiveSession = typeof window !== 'undefined' && localStorage.getItem('sct_auth_active') === 'true';
    if (
      response.status === 401 &&
      (inMemoryAccessToken || hasActiveSession) &&
      !options.skipAuth &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/register') &&
      !endpoint.includes('/auth/refresh')
    ) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Attempt silent refresh using HttpOnly cookie
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (refreshRes.ok) {
            const refreshData = (await refreshRes.json()) as ApiResponse<{ accessToken: string }>;
            const newToken = refreshData.data?.accessToken;
            if (newToken) {
              setAccessToken(newToken);
              onRefreshed(newToken);

              // Retry original request with new token
              headers.set('Authorization', `Bearer ${newToken}`);
              response = await fetch(url, { ...fetchOptions, headers });
            } else {
              onRefreshFailed();
              if (typeof window !== 'undefined') {
                localStorage.removeItem('sct_auth_active');
              }
            }
          } else {
            onRefreshFailed();
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sct_auth_active');
            }
          }
        } catch {
          onRefreshFailed();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sct_auth_active');
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        // Queue parallel requests until refresh completes
        const retryToken = await new Promise<string>((resolve, reject) => {
          refreshSubscribers.push((err, token) => {
            if (err) {
              reject(err);
            } else if (token) {
              resolve(token);
            } else {
              reject(new ApiError('Session expired. Please sign in again.', 401));
            }
          });
          setTimeout(() => reject(new ApiError('Refresh timeout', 408)), 10000);
        });
        headers.set('Authorization', `Bearer ${retryToken}`);
        response = await fetch(url, { ...fetchOptions, headers });
      }
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const retryAfter = response.headers.get('retry-after');
      const errorMessage =
        data?.message ||
        (data?.errors && data.errors.length > 0 ? data.errors[0].message : null) ||
        (response.status === 429
          ? `Too many requests. Please wait ${retryAfter ? retryAfter + ' seconds' : 'a moment'} before trying again.`
          : `Request failed with status ${response.status}`);
      throw new ApiError(errorMessage, response.status, data?.errors);
    }

    return (data?.data !== undefined ? data.data : data) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors, connection refused, CORS blocks
    throw new ApiError(
      (error as Error)?.message || 'Unable to connect to the backend server. Please check your network or server status.',
      0
    );
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
