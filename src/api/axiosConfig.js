import axios from 'axios';

// Kreiramo instancu axiosa s osnovnim postavkama
const api = axios.create({
    baseURL: 'https://zavrsni-rad-six-sage.vercel.app'
});

// REQUEST Interceptor: Dodaje token prije svakog zahtjeva
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE Interceptor: Hvata greške iz odgovora servera
api.interceptors.response.use(
    (response) => {
        // Ako je odgovor uspješan (status 2xx), samo ga proslijedi dalje
        return response;
    },
    (error) => {
        // Ako server vrati 401 (Neovlašteno - token istekao ili ne postoji)
        if (error.response && error.response.status === 401) {
            // Obriši neispravan/istekao token iz memorije
            localStorage.removeItem('adminToken');

            // Preusmjeri korisnika na login stranicu
            // Koristimo window.location jer smo izvan React Router konteksta
            window.location.href = '/login';
        }

        // Ostale greške proslijedi komponentama da ih obrade (npr. prikažu toast poruku)
        return Promise.reject(error);
    }
);

export default api;