const request = async (method, url, data = null, options = {}) => {
  const BASE_URL = useRuntimeConfig().public.apiBaseUrl;
  const model = localStorage.getItem(LOCALSTORAGE_KEYS.MODEL) || 'llama3.2:latest';

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      model,
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
};
