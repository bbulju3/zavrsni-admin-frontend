import axios from 'axios';

// Kreiramo instancu axiosa s osnovnim postavkama
const api = axios.create({
    // Za sada ciljamo tvoj lokalni backend server. 
    // Kasnije, kada backend staviš na Vercel, ovdje će ići taj URL (npr. 'https://tvoj-backend.vercel.app')
    baseURL: 'https://zavrsni-rad-six-sage.vercel.app'
});

// Interceptor: Ova funkcija se automatski pokreće PRIJE svakog API zahtjeva
api.interceptors.request.use(
    (config) => {
        // Pokušavamo dohvatiti token iz lokalne memorije preglednika (localStorage)
        const token = localStorage.getItem('adminToken');

        // Ako token postoji, automatski ga dodajemo u Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Ako dođe do greške pri slanju zahtjeva, samo ju prosljeđujemo dalje
        return Promise.reject(error);
    }
);

export default api;