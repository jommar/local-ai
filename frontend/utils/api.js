const getHeaderData = () => {
  return {
    model: localStorage.getItem(LOCALSTORAGE_KEYS.MODEL) || 'llama3.2:latest',
    think: localStorage.getItem(LOCALSTORAGE_KEYS.THINK) || true,
    stream: localStorage.getItem(LOCALSTORAGE_KEYS.STREAM) || true,
  };
};

const _postStream = async (url, data, onMessage) => {
  const BASE_URL = useRuntimeConfig().public.apiBaseUrl;

  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getHeaderData(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok || !res.body) {
    throw new Error('Failed to start stream');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let partial = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    partial += decoder.decode(value, { stream: true });
    const lines = partial.split('\n');

    // Keep last part in case it's not a full JSON line
    partial = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;

      try {
        const jsonStr = line.replace(/^data:\s*/, '');
        const parsed = JSON.parse(jsonStr);
        onMessage?.(parsed);
      } catch (e) {
        console.warn('Failed to parse chunk:', line, e);
      }
    }
  }
};

const request = async (method, url, data = null, options = {}) => {
  const BASE_URL = useRuntimeConfig().public.apiBaseUrl;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...getHeaderData(),
    },
    ...options,
  };

  if (data) config.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${url}`, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API Error');
  }

  return res.json();
};

// Convenience methods
export const api = {
  get: (url, options) => request('GET', url, null, options),
  post: (url, data, options) => request('POST', url, data, options),
  put: (url, data, options) => request('PUT', url, data, options),
  delete: (url, options) => request('DELETE', url, null, options),
  postStream: _postStream,
};
