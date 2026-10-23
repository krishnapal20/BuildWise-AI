import axios from 'axios';

let baseURL = '/api';
if (import.meta.env.VITE_API_URL) {
  const cleanUrl = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
  baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const api = axios.create({
  baseURL,
  timeout: 60000,
});

export default api;
