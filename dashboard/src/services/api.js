import axios from 'axios';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION RÉSEAU — décommente UNE seule ligne selon ton mode
// ═══════════════════════════════════════════════════════════════

// 💻 MODE LOCAL (dashboard testé sur le même PC que le serveur)
const BASE_URL = 'https://iuctrack-api.onrender.com/api';

// 📶 MODE RÉSEAU (dashboard testé depuis un autre appareil sur le même Wi-Fi/hotspot)
// const BASE_URL = 'http://172.20.10.3:8000/api';

// 🔌 MODE CÂBLE RÉSEAU (partage de connexion Windows via Ethernet)
// const BASE_URL = 'http://192.168.137.1:8000/api';

// ═══════════════════════════════════════════════════════════════

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;