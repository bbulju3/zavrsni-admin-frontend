import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [lozinka, setLozinka] = useState('');
    const [greska, setGreska] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setGreska('');

        try {
            const response = await api.post('/api/auth/admin-login', {
                email: email,
                lozinka: lozinka
            });
            localStorage.setItem('adminToken', response.data.token);
            navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.data.greska) {
                setGreska(error.response.data.greska);
            } else {
                setGreska('Došlo je do greške prilikom prijave.');
            }
        }
    };

    return (
        /* Glavni kontejner: zauzima cijeli ekran (min-h-screen), postavlja blagu sivu pozadinu (bg-slate-50),
          te centrirano pozicionira formu unutar ekrana pomoću Flexboxa (flex items-center justify-center)
        */
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

            {/* Kartica forme: bijela pozadina, zaobljeni rubovi (rounded-2xl), duboka sjena (shadow-xl),
            ograničena širina (max-w-md) i unutrašnji razmak (p-8)
            */}
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">

                {/* Naslov prijave s modernim tamnim fontom */}
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Admin Panel</h2>
                <p className="text-sm text-center text-slate-500 mb-6">Prijavite se za upravljanje sustavom</p>

                {/* Prikaz greške u obliku crvenog okvira s blagom pozadinom */}
                {greska && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                        {greska}
                    </div>
                )}

                {/* Form s vertikalnim rasporedom i razmakom (space-y-4) */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email adresa</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="ime@domena.com"
                            /* Input polje: definiran obrub, tranzicija boje pri fokusu (focus:ring-2),
                              micanje zadanog okvira (focus:outline-none) i ugodan padding
                            */
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Lozinka</label>
                        <input
                            type="password"
                            value={lozinka}
                            onChange={(e) => setLozinka(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Gumb za prijavu koji se proteže cijelom širinom (w-full) s efektom promjene boje na prijelaz miša (hover:bg-blue-700) */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer mt-2"
                    >
                        Prijavi se
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;