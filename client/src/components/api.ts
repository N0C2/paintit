
let onAuthFailure: (() => void) | null = null;

export const setOnAuthFailure = (callback: () => void) => {
  onAuthFailure = callback;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  // Automatically set Content-Type for JSON bodies
  if (options.body && typeof options.body === 'string') {
    headers.append('Content-Type', 'application/json');
  }

  options.headers = headers;

  const response = await fetch(url, options);

  if (response.status === 401 && onAuthFailure) {
    onAuthFailure();
  }

  return response;
};
