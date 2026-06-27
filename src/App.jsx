import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import ResourcesTable from './components/ResourcesTable'; // Uvozimo komponentu tablice

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-800">
            <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col justify-between p-5 shadow-xl">
                <div>
                    <div className="text-xl font-bold text-white tracking-wider border-b border-slate-800 pb-4 mb-6">
                        ADMIN PANEL
                    </div>

                    <nav className="space-y-1">
                        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors">
                            📦 Resursi
                        </div>
                        <div className="px-4 py-2.5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl font-medium cursor-pointer transition-colors">
                            👥 Korisnici
                        </div>
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-slate-900 hover:bg-red-900/40 hover:text-red-400 text-slate-400 font-semibold py-2.5 px-4 rounded-xl border border-slate-800 hover:border-red-900/60 transition-all cursor-pointer"
                >
                    🚪 Odjava
                </button>
            </aside>

            <main className="flex-1 p-8">
                <header className="flex justify-between items-center border-b border-slate-200 pb-5 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Upravljanje resursima</h1>
                        <p className="text-sm text-slate-500">Pregled, filtriranje i upravljanje imovinom.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-600">Sustav aktivan</span>
                    </div>
                </header>

                {/* Radni prostor s tvojom tablicom */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">Popis svih resursa</h3>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer">
                            + Dodaj novi resurs
                        </button>
                    </div>

                    {/* Ovdje se iscrtava tablica */}
                    <ResourcesTable />
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