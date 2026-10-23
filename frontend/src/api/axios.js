import axios from 'axios';

const defaultBackend = 'https://buildwise-ai-wa8o.onrender.com';
const apiBase = import.meta.env.VITE_API_URL || defaultBackend;
const cleanUrl = apiBase.trim().replace(/\/$/, '');
const baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

const api = axios.create({
  baseURL,
  timeout: 60000,
});

export default api;
