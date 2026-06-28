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

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-800">
            {/* Navigacija */}
            <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col justify-between p-5 shadow-xl shrink-0">
                <div>
                    <div className="text-xl font-bold text-white tracking-wider border-b border-slate-800 pb-4 mb-6">
                        ADMIN PANEL
                    </div>

                    <nav className="space-y-2">
                        <div
                            onClick={() => setActiveTab('home')}
                            className={`px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}
                        >
                            🏠 Početna
                        </div>
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

            {/* ISPRAVAK: main ima flex-1 i min-w-0 da zadrži oblik, ali nema overflow-x-auto */}
            <main className="flex-1 min-w-0 p-8 flex flex-col h-screen overflow-y-auto">
                {/* ISPRAVAK: Maknut je min-w-max iz headera kako se ne bi rastezao u beskonačnost */}
                <header className="flex justify-between items-center border-b border-slate-200 pb-5 mb-8 shrink-0">
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
                                <p className="text-sm text-slate-500 mt-1">Pregled pregledne tablice, dodavanje novih prostora, opreme i vozila te ažuriranje kapaciteta.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('korisnici')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">👥</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Korisnici</h3>
                                <p className="text-sm text-slate-500 mt-1">Upravljanje računima registriranih korisnika sustava i provjera njihovih statusa.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('administratori')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">👔</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Administratori</h3>
                                <p className="text-sm text-slate-500 mt-1">Pregled i postavljanje administratorskih ovlasti i računa s pristupom panelu.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('rezervacije')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">📅</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Rezervacije</h3>
                                <p className="text-sm text-slate-500 mt-1">Praćenje svih rezerviranih termina, odobravanje i koordinacija dodijeljenih dobara.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('zabrane')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">🚫</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Zabrane Pristupa</h3>
                                <p className="text-sm text-slate-500 mt-1">Restrikcije i restriktivne mjere nad korisnicima po resursu ili po tipu resursa.</p>
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-red-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[150px]"
                        >
                            <div>
                                <span className="text-3xl mb-3 block">🚪</span>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors">Sigurna odjava</h3>
                                <p className="text-sm text-slate-500 mt-1">Zatvaranje trenutne administratorske sesije i siguran povratak na formu za prijavu.</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* ISPRAVAK: SADA JE SAMO OVAJ KONTEJNER ZADUŽEN ZA OVERFLOW TABLICA */}
                {activeTab !== 'home' && (
                    <div className="w-full overflow-x-auto pb-4 rounded-lg bg-white shadow-sm border border-slate-200">
                        {activeTab === 'resursi' && <ResourcesTable />}
                        {activeTab === 'korisnici' && <UsersTable />}
                        {activeTab === 'administratori' && <AdminsTable />}
                        {activeTab === 'rezervacije' && <ReservationsTable />}
                        {activeTab === 'zabrane' && <ZabraneTable />}
                    </div>
                )}

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