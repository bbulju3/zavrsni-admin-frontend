import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        /* Glavni raspored: Flexbox koji dijeli ekran na bočni dio (Sidebar) i glavni dio */
        <div className="flex min-h-screen bg-slate-100 text-slate-800">

            {/* BOČNA TRAKA (Sidebar) - Tamna pozadina (bg-slate-950), fiksna širina (w-64) */}
            <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col justify-between p-5 shadow-xl">
                <div>
                    {/* Logo ili naziv aplikacije na vrhu sidebara */}
                    <div className="text-xl font-bold text-white tracking-wider border-b border-slate-800 pb-4 mb-6">
                        ADMIN PANEL
                    </div>

                    {/* Navigacijski linkovi (trenutno nefunkcionalni demo prikazi) */}
                    <nav className="space-y-1">
                        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors">
                            📊 Dashboard
                        </div>
                        <div className="px-4 py-2.5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl font-medium cursor-pointer transition-colors">
                            📦 Resursi
                        </div>
                        <div className="px-4 py-2.5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl font-medium cursor-pointer transition-colors">
                            👥 Korisnici
                        </div>
                    </nav>
                </div>

                {/* Gumb za odjavu smješten na samo dno bočne trake */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-slate-900 hover:bg-red-900/40 hover:text-red-400 text-slate-400 font-semibold py-2.5 px-4 rounded-xl border border-slate-800 hover:border-red-900/60 transition-all cursor-pointer"
                >
                    🚪 Odjava
                </button>
            </aside>

            {/* GLAVNI SADRŽAJ (Main Panel) - Dinamički se širi (flex-1) */}
            <main className="flex-1 p-8">
                {/* Gornja traka (Header) glavnog sadržaja */}
                <header className="flex justify-between items-center border-b border-slate-200 pb-5 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Pregled sustava</h1>
                        <p className="text-sm text-slate-500">Dobrodošli natrag u kontrolnu ploču.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-600">Sustav aktivan</span>
                    </div>
                </header>

                {/* Radni prostor: Mjesto gdje će uskoro ići tablice */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-50 p-4 rounded-full text-3xl mb-3">🛠️</div>
                    <h3 className="text-lg font-bold text-slate-800">Spreman za tablice</h3>
                    <p className="text-slate-500 max-w-sm mt-1 text-sm">
                        Sučelje je uspješno konfigurirano s Tailwindom v4. Sljedeći korak je povlačenje podataka s backenda i izrada tablice za resurse.
                    </p>
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;