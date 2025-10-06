const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

interface RequestOptions<TPayload> {
  action: string;
  payload?: TPayload;
  signal?: AbortSignal;
}

interface FetchOptions {
  retries?: number;
  retryDelayMs?: number;
}

const defaultFetchOptions: Required<FetchOptions> = {
  retries: 2,
  retryDelayMs: 250,
};

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function apiRequest<TPayload, TResponse>(
  { action, payload, signal }: RequestOptions<TPayload>,
  options: FetchOptions = {},
): Promise<TResponse> {
  if (!BASE_URL) {
    throw new Error('API_BASE_URL not configured');
  }

  const { retries, retryDelayMs } = { ...defaultFetchOptions, ...options };
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({ action, payload }),
        signal,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || response.statusText);
      }

      const json = (await response.json()) as { ok: boolean; data?: TResponse; error?: string };

      if (!json.ok) {
        throw new Error(json.error ?? 'Tundmatu serveri viga');
      }

      return json.data as TResponse;
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      await sleep(retryDelayMs * (attempt + 1));
    }
    attempt += 1;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Päring ebaõnnestus tundmatu vea tõttu');
}
