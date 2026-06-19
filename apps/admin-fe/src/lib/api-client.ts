const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
  requestId?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  getToken?: () => string | null;
}

export async function apiFetch<T>(path: string, opts: ApiClientOptions = {}): Promise<T> {
  const { body, getToken, headers, ...rest } = opts;
  const token = getToken?.();
  const init: RequestInit = {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(`${API_URL}${path}`, init);

  if (!res.ok) {
    let parsed: ApiErrorBody | undefined;
    try {
      parsed = (await res.json()) as ApiErrorBody;
    } catch {
      /* ignore */
    }
    const err = parsed?.error;
    throw new ApiError(
      res.status,
      err?.code ?? 'UNKNOWN',
      err?.message ?? res.statusText,
      err?.details,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
