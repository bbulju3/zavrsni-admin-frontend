import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import ResourcesTable from './components/ResourcesTable';
import UsersTable from './components/UsersTable';
import AdminsTable from './components/AdminsTable';
import ReservationsTable from './components/ReservationsTable';
import ZabraneTable from './components/ZabraneTable'; // 1. NOVI UVOZ

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('resursi');

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

                    <nav className="space-y-2">
                        <div
                            onClick={() => setActiveTab('resursi')}
                            className={`px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'resursi' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            📦 Resursi
                        </div>
                        <div
                            onClick={() => setActiveTab('korisnici')}
                            className={`px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'korisnici' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            👥 Korisnici
                        </div>
                        <div
                            onClick={() => setActiveTab('administratori')}
                            className={`px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'administratori' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            👔 Administratori
                        </div>
                        <div
                            onClick={() => setActiveTab('rezervacije')}
                            className={`px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'rezervacije' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            📅 Rezervacije
                        </div>
                        {/* 2. NOVI GUMB ZA ZABRANE */}
                        <div
                            onClick={() => setActiveTab('zabrane')}
                            className={`px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'zabrane' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            🚫 Zabrane Pristupa
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
                        <h1 className="text-2xl font-bold text-slate-900">
                            {activeTab === 'resursi' && 'Upravljanje resursima'}
                            {activeTab === 'korisnici' && 'Upravljanje korisnicima'}
                            {activeTab === 'administratori' && 'Upravljanje administratorima'}
                            {activeTab === 'rezervacije' && 'Upravljanje rezervacijama'}
                            {activeTab === 'zabrane' && 'Upravljanje zabranama pristupa'} {/* 3. NASLOV */}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {activeTab === 'resursi' && 'Pregled i upravljanje resursima.'}
                            {activeTab === 'korisnici' && 'Pregled i upravljanje korisničkim računima.'}
                            {activeTab === 'administratori' && 'Pregled i upravljanje administratorskim računima.'}
                            {activeTab === 'rezervacije' && 'Pregled i upravljanje rezervacijama resursa.'}
                            {activeTab === 'zabrane' && 'Pregled i upravljanje korisničkim zabranama.'} {/* 3. OPIS */}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-600">Sustav aktivan</span>
                    </div>
                </header>

                {/* Uvjetno renderiranje komponenata */}
                {activeTab === 'resursi' && <ResourcesTable />}
                {activeTab === 'korisnici' && <UsersTable />}
                {activeTab === 'administratori' && <AdminsTable />}
                {activeTab === 'rezervacije' && <ReservationsTable />}
                {activeTab === 'zabrane' && <ZabraneTable />} {/* 4. RENDERIRANJE KOMPONENTE */}

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