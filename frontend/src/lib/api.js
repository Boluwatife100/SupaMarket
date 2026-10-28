import axios from 'axios';

const TOKEN_KEY = 'shop.token';

// '/api' works everywhere: the Vite dev server and nginx (Docker) both proxy it to the Express API.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Expired or invalid token: tell the app to sign the user out.
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error) {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  return 'Cannot reach the server. Check that the API is running.';
}
