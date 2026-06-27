import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; // Uvozimo naš konfigurirani axios

const Login = () => {
    // useState koristimo za praćenje onoga što korisnik upisuje u polja
    const [email, setEmail] = useState('');
    const [lozinka, setLozinka] = useState('');
    const [greska, setGreska] = useState('');

    // useNavigate nam služi za programatsko prebacivanje korisnika na drugi ekran
    const navigate = useNavigate();

    // Funkcija koja se okida kada korisnik stisne "Prijavi se"
    const handleLogin = async (e) => {
        e.preventDefault(); // Sprječava defaultno osvježavanje stranice prilikom slanja forme
        setGreska(''); // Čistimo prethodne greške

        try {
            // Šaljemo POST zahtjev na tvoju backend rutu za admin prijavu
            const response = await api.post('/api/auth/admin-login', {
                email: email,
                lozinka: lozinka
            });

            // Ako je prijava uspješna, backend vraća token. Spremamo ga u localStorage.
            localStorage.setItem('adminToken', response.data.token);

            // Prebacujemo korisnika na početni ekran (Dashboard)
            navigate('/dashboard');
        } catch (error) {
            // Ako backend vrati grešku (npr. 401 kriva lozinka), zapisujemo ju kako bismo ju prikazali
            if (error.response && error.response.data.greska) {
                setGreska(error.response.data.greska);
            } else {
                setGreska('Došlo je do greške prilikom prijave.');
            }
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Admin Prijava</h2>

            {/* Prikaz poruke o grešci ako postoji */}
            {greska && <p style={{ color: 'red' }}>{greska}</p>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        // Svaki put kad korisnik tipka, ažuriramo 'email' varijablu
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label>Lozinka:</label>
                    <input
                        type="password"
                        value={lozinka}
                        // Svaki put kad korisnik tipka, ažuriramo 'lozinka' varijablu
                        onChange={(e) => setLozinka(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                    Prijavi se
                </button>
            </form>
        </div>
    );
};

export default Login;