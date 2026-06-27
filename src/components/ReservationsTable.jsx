import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';

const ReservationsTable = () => {
    // 1. STATE ZA PODATKE (Tablice)
    const [rezervacije, setRezervacije] = useState([]);
    const [korisnici, setKorisnici] = useState([]);
    const [resursi, setResursi] = useState([]);

    // STATE ZA UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState(null);
    const [filters, setFilters] = useState({ status: '' });

    // 2. STATE ZA MODALNE PROZORE
    const initialFormState = {
        korisnik_id: '',
        resurs_id: '',
        vrijeme_pocetka: '',
        vrijeme_zavrsetka: '',
        status: 'aktivna',
        napomena_admina: ''
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState(initialFormState);
    const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, id: null });

    // POMOĆNE FUNKCIJE ZA DATUME (Frontend <-> Backend)
    // Pretvara iz baze "2026-06-27T14:30:00.000Z" u format za datetime-local "2026-06-27T16:30"
    const formatForInput = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        // Lokalno vrijeme
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Pretvara datetime-local "2026-06-27T16:30" u MySQL format "2026-06-27 16:30:00"
    const formatForMySQL = (localDateTime) => {
        if (!localDateTime) return null;
        return localDateTime.replace('T', ' ') + ':00';
    };

    // 3. DOHVAĆANJE PODATAKA
    const fetchRezervacije = async () => {
        try {
            const response = await api.get('/api/rezervacije');
            setRezervacije(response.data);
        } catch (err) {
            console.error("Greška pri osvježavanju podataka:", err);
        }
    };

    useEffect(() => {
        const initialLoad = async () => {
            try {
                // Paralelno povlačimo rezervacije, korisnike i resurse
                const [rezRes, korRes, resRes] = await Promise.all([
                    api.get('/api/rezervacije'),
                    api.get('/api/korisnici'),
                    api.get('/api/resursi') // Pretpostavka putanje za resurse
                ]);

                setRezervacije(rezRes.data);
                setKorisnici(korRes.data);
                setResursi(resRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Greška pri inicijalnom dohvaćanju:", err);
                setError('Ne mogu dohvatiti podatke s backenda.');
                setLoading(false);
            }
        };
        initialLoad();
    }, []);

    // 4. CRUD LOGIKA
    const openCreateModal = () => {
        setModalMode('create');
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setFormData({
            id: item.id,
            korisnik_id: item.korisnik_id,
            resurs_id: item.resurs_id,
            vrijeme_pocetka: formatForInput(item.vrijeme_pocetka),
            vrijeme_zavrsetka: formatForInput(item.vrijeme_zavrsetka),
            status: item.status,
            napomena_admina: item.napomena_admina || ''
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Pripremamo payload s ispravnim MySQL formatom datuma
            const payload = {
                ...formData,
                vrijeme_pocetka: formatForMySQL(formData.vrijeme_pocetka),
                vrijeme_zavrsetka: formatForMySQL(formData.vrijeme_zavrsetka)
            };

            if (modalMode === 'create') {
                await api.post('/api/rezervacije', payload);
            } else if (modalMode === 'edit') {
                await api.put(`/api/rezervacije/${formData.id}`, payload);
            }
            setIsModalOpen(false);
            fetchRezervacije();
        } catch (err) {
            console.error("Greška pri spremanju:", err);
            alert('Došlo je do greške prilikom spremanja rezervacije.');
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/rezervacije/${deleteAlert.id}`);
            setDeleteAlert({ isOpen: false, id: null });
            fetchRezervacije();
        } catch (err) {
            console.error("Greška pri brisanju:", err);
            alert('Došlo je do greške prilikom brisanja rezervacije.');
        }
    };

    // 5. LOGIKA ZA TABLICU
    const getUserName = (id) => {
        const user = korisnici.find(k => k.id === id);
        return user ? `${user.ime} ${user.prezime}` : `ID: ${id}`;
    };

    const getResourceName = (id) => {
        const resurs = resursi.find(r => r.id === id);
        return resurs ? resurs.naziv || resurs.ime || `Resurs ${id}` : `ID: ${id}`;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let data = [...rezervacije];
        if (filters.status) {
            data = data.filter(item => item.status === filters.status);
        }
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue = a[sortConfig.key] || '';
                let bValue = b[sortConfig.key] || '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [rezervacije, filters, sortConfig]);

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'aktivna': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'zavrsena': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'otkazana': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div className="p-4 text-slate-500">Učitavanje rezervacija...</div>;
    if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Popis svih rezervacija</h3>
                <button
                    onClick={openCreateModal}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    + Nova rezervacija
                </button>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top min-w-[150px]">Korisnik</th>
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top min-w-[150px]">Resurs</th>
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top cursor-pointer select-none" onClick={() => requestSort('vrijeme_pocetka')}>
                                Početak {sortConfig?.key === 'vrijeme_pocetka' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top cursor-pointer select-none" onClick={() => requestSort('vrijeme_zavrsetka')}>
                                Završetak {sortConfig?.key === 'vrijeme_zavrsetka' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top min-w-[120px]">
                                <div className="mb-2 select-none">Status</div>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ status: e.target.value })}
                                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-amber-500 font-normal shadow-sm bg-white text-slate-700 cursor-pointer"
                                >
                                    <option value="">Svi</option>
                                    <option value="aktivna">Aktivna</option>
                                    <option value="zavrsena">Završena</option>
                                    <option value="otkazana">Otkazana</option>
                                </select>
                            </th>
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top text-center w-28">Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 text-sm font-medium text-slate-800">{getUserName(item.korisnik_id)}</td>
                                    <td className="p-3 text-sm text-amber-600 font-medium">{getResourceName(item.resurs_id)}</td>
                                    <td className="p-3 text-sm text-slate-600">{formatDisplayDate(item.vrijeme_pocetka)}</td>
                                    <td className="p-3 text-sm text-slate-600">{formatDisplayDate(item.vrijeme_zavrsetka)}</td>
                                    <td className="p-3 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusStyle(item.status)}`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                        {item.napomena_admina && (
                                            <div className="mt-1 text-xs text-slate-400 italic" title={item.napomena_admina}>
                                                📝 Postoji napomena
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 text-sm text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* UPDATE gumb se prikazuje SAMO ako je status aktivna */}
                                            {item.status === 'aktivna' ? (
                                                <button onClick={() => openEditModal(item)} className="text-amber-500 hover:text-amber-700 font-medium cursor-pointer p-1" title="Uredi">✎</button>
                                            ) : (
                                                <span className="p-1 w-[28px] inline-block"></span> /* Prazan prostor za poravnanje brisanja */
                                            )}
                                            <button onClick={() => setDeleteAlert({ isOpen: true, id: item.id })} className="text-red-600 hover:text-red-800 font-medium cursor-pointer p-1" title="Obriši">🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">
                                    Nema pronađenih rezervacija.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL ZA CREATE / UPDATE */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            {modalMode === 'create' ? 'Nova rezervacija' : 'Uredi rezervaciju'}
                        </h2>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Korisnik <span className="text-red-500">*</span></label>
                                <select required value={formData.korisnik_id} onChange={(e) => setFormData({ ...formData, korisnik_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                                    <option value="" disabled>Odaberi korisnika...</option>
                                    {korisnici.map(k => (
                                        <option key={k.id} value={k.id}>{k.ime} {k.prezime} ({k.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Resurs <span className="text-red-500">*</span></label>
                                <select required value={formData.resurs_id} onChange={(e) => setFormData({ ...formData, resurs_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                                    <option value="" disabled>Odaberi resurs...</option>
                                    {resursi.map(r => (
                                        <option key={r.id} value={r.id}>{r.naziv || r.ime || `Resurs ${r.id}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Početak <span className="text-red-500">*</span></label>
                                    <input type="datetime-local" required value={formData.vrijeme_pocetka} onChange={(e) => setFormData({ ...formData, vrijeme_pocetka: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Završetak <span className="text-red-500">*</span></label>
                                    <input type="datetime-local" required value={formData.vrijeme_zavrsetka} onChange={(e) => setFormData({ ...formData, vrijeme_zavrsetka: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                                <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                                    <option value="aktivna">Aktivna</option>
                                    <option value="zavrsena">Završena</option>
                                    <option value="otkazana">Otkazana</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Napomena administratora</label>
                                <textarea rows="2" value={formData.napomena_admina} onChange={(e) => setFormData({ ...formData, napomena_admina: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Opcionalno..."></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                    Odustani
                                </button>
                                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer">
                                    {modalMode === 'create' ? 'Spremi rezervaciju' : 'Spremi izmjene'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ZA POTVRDU BRISANJA */}
            {deleteAlert.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Brisanje rezervacije</h2>
                        <p className="text-slate-500 mb-6">Jeste li sigurni da želite obrisati ovu rezervaciju? Ova akcija se ne može poništiti.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteAlert({ isOpen: false, id: null })} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer w-full">
                                Odustani
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer w-full">
                                Obriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationsTable;