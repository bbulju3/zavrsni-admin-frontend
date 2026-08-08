import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import ResourcesTable from './components/ResourcesTable';
import UsersTable from './components/UsersTable';
import AdminsTable from './components/AdminsTable';
import ReservationsTable from './components/ReservationsTable';
import ZabraneTable from './components/ZabraneTable';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-800">
            <aside className={`${isCollapsed ? 'w-20 p-3' : 'w-64 p-5'} bg-slate-950 text-slate-200 flex flex-col justify-between shadow-xl shrink-0 transition-all duration-300 ease-in-out`}>
                <div>
                    <div className={`font-bold text-white tracking-wider border-b border-slate-800 pb-4 mb-6 flex items-center ${isCollapsed ? 'justify-center text-sm' : 'text-xl'}`}>
                        {isCollapsed ? 'AP' : 'ADMIN PANEL'}
                    </div>

                    <nav className="space-y-2">
                        <div
                            onClick={() => setActiveTab('home')}
                            title="Početna"
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            <span className="text-xl">🏠</span>
                            {!isCollapsed && <span className="ml-3">Početna</span>}
                        </div>
                        <div
                            onClick={() => setActiveTab('resursi')}
                            title="Resursi"
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'resursi' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            <span className="text-xl">📦</span>
                            {!isCollapsed && <span className="ml-3">Resursi</span>}
                        </div>
                        <div
                            onClick={() => setActiveTab('korisnici')}
                            title="Korisnici"
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'korisnici' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            <span className="text-xl">👥</span>
                            {!isCollapsed && <span className="ml-3">Korisnici</span>}
                        </div>
                        <div
                            onClick={() => setActiveTab('administratori')}
                            title="Administratori"
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'administratori' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            <span className="text-xl">👔</span>
                            {!isCollapsed && <span className="ml-3">Administratori</span>}
                        </div>
                        <div
                            onClick={() => setActiveTab('rezervacije')}
                            title="Rezervacije"
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'rezervacije' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            <span className="text-xl">📅</span>
                            {!isCollapsed && <span className="ml-3">Rezervacije</span>}
                        </div>
                        <div
                            onClick={() => setActiveTab('zabrane')}
                            title="Zabrane Pristupa"
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'zabrane' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            <span className="text-xl">🚫</span>
                            {!isCollapsed && <span className="ml-3 overflow-hidden whitespace-nowrap">Zabrane Pristupa</span>}
                        </div>
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    title="Odjava"
                    className={`w-full flex items-center justify-center bg-slate-900 hover:bg-red-900/40 hover:text-red-400 text-slate-400 font-semibold py-2.5 ${isCollapsed ? 'px-0' : 'px-4'} rounded-xl border border-slate-800 hover:border-red-900/60 transition-all cursor-pointer`}
                >
                    <span className="text-xl">🚪</span>
                    {!isCollapsed && <span className="ml-3">Odjava</span>}
                </button>
            </aside>

            <main className="flex-1 min-w-0 p-8 overflow-x-auto">
                <header className="flex justify-between items-center border-b border-slate-200 pb-5 mb-8 min-w-max">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 bg-slate-200/60 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                            title={isCollapsed ? "Proširi alatnu traku" : "Sakrij alatnu traku"}
                        >
                            <span className="text-xl leading-none">☰</span>
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {activeTab === 'home' && 'Dobrodošli natrag!'}
                                {activeTab === 'resursi' && 'Upravljanje resursima'}
                                {activeTab === 'korisnici' && 'Upravljanje korisnicima'}
                                {activeTab === 'administratori' && 'Upravljanje administratorima'}
                                {activeTab === 'rezervacije' && 'Upravljanje rezervacijama'}
                                {activeTab === 'zabrane' && 'Upravljanje zabranama pristupa'}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {activeTab === 'home' && 'Odaberite sekciju ili tablicu kojom želite upravljati.'}
                                {activeTab === 'resursi' && 'Pregled i upravljanje resursima.'}
                                {activeTab === 'korisnici' && 'Pregled i upravljanje korisničkim računima.'}
                                {activeTab === 'administratori' && 'Pregled i upravljanje administratorskim računima.'}
                                {activeTab === 'rezervacije' && 'Pregled i upravljanje rezervacijama.'}
                                {activeTab === 'zabrane' && 'Pregled i upravljanje zabranama pristupa.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-600">Sustav aktivan</span>
                    </div>
                </header>

                {activeTab === 'home' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">

                        <button
                            onClick={() => setActiveTab('resursi')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">📦</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Resursi</h3>
                                <p className="text-sm text-slate-500 mt-1">Pregled tablice resursa, dodavanje novih i ažuriranje postojećih resursa.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('korisnici')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">👥</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Korisnici</h3>
                                <p className="text-sm text-slate-500 mt-1">Pregled tablice korisnika, dodavanje novih i ažuriranje postojećih korisnika.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('administratori')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">👔</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Administratori</h3>
                                <p className="text-sm text-slate-500 mt-1">Pregled tablice administratora, dodavanje novih i ažuriranje postojećih administratora.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('rezervacije')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">📅</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Rezervacije</h3>
                                <p className="text-sm text-slate-500 mt-1">Pregled tablice rezervacija, dodavanje novih i ažuriranje postojećih rezervacija.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('zabrane')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">🚫</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Zabrane Pristupa</h3>
                                <p className="text-sm text-slate-500 mt-1">Pregled tablice zabrana pristupa, dodavanje novih i ažuriranje postojećih zabrana pristupa.</p>
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-red-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">🚪</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors">Sigurna odjava</h3>
                                <p className="text-sm text-slate-500 mt-1">Zatvaranje trenutne administratorske sesije i povratak na formu za prijavu.</p>
                            </div>
                        </button>

                    </div>
                )}

                <div className="w-full">
                    {activeTab === 'resursi' && <ResourcesTable />}
                    {activeTab === 'korisnici' && <UsersTable />}
                    {activeTab === 'administratori' && <AdminsTable />}
                    {activeTab === 'rezervacije' && <ReservationsTable />}
                    {activeTab === 'zabrane' && <ZabraneTable />}
                </div>

            </main>
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;