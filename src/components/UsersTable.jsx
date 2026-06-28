import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';

const UsersTable = () => {
    // 1. STATE ZA PODATKE I TABLICU
    const [korisnici, setKorisnici] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState(null);
    const [filters, setFilters] = useState({ ime: '', prezime: '', email: '' });

    // 2. STATE ZA MODALNE PROZORE
    const initialFormState = { ime: '', prezime: '', email: '', lozinka: '' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState(initialFormState);
    const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, id: null });
    const [formError, setFormError] = useState('');

    // 3. DOHVAĆANJE PODATAKA
    const fetchKorisnici = async () => {
        try {
            const response = await api.get('/api/korisnici');
            setKorisnici(response.data);
        } catch (err) {
            console.error("Greška pri osvježavanju podataka:", err);
        }
    };

    useEffect(() => {
        const initialLoad = async () => {
            try {
                const response = await api.get('/api/korisnici');
                setKorisnici(response.data);
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
        setFormError(''); // Očisti grešku kod novog otvaranja
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setFormData({
            id: item.id,
            ime: item.ime,
            prezime: item.prezime,
            email: item.email,
            lozinka: ''
        });
        setFormError(''); // Očisti grešku kod novog otvaranja
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError(''); // Očisti prethodnu grešku pri novom pokušaju slanja

        try {
            if (modalMode === 'create') {
                await api.post('/api/korisnici', formData); // Za AdminsTable ovdje ide /api/administratori
            } else if (modalMode === 'edit') {
                const payload = { ...formData };
                if (!payload.lozinka) {
                    delete payload.lozinka;
                }
                await api.put(`/api/korisnici/${formData.id}`, payload); // Za AdminsTable ovdje ide /api/administratori...
            }
            setIsModalOpen(false);
            fetchKorisnici(); // Za AdminsTable ovdje ide fetchAdministratori()
        } catch (err) {
            console.error("Greška pri spremanju:", err);

            // Axios sprema odgovor s backenda u err.response.data
            if (err.response && err.response.data) {
                // Pokušavamo uhvatiti standardne ključeve (message, error) ili cijeli string
                const backendPoruka = err.response.data.message || err.response.data.error || err.response.data;

                if (typeof backendPoruka === 'string') {
                    setFormError(backendPoruka);
                } else {
                    setFormError('Podaci nisu u ispravnom formatu. Provjerite email i lozinku.');
                }
            } else {
                setFormError('Došlo je do greške prilikom komunikacije sa serverom.');
            }
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/korisnici/${deleteAlert.id}`);
            setDeleteAlert({ isOpen: false, id: null });
            fetchKorisnici();
        } catch (err) {
            console.error("Greška pri brisanju:", err);
            alert('Došlo je do greške prilikom brisanja korisnika.');
        }
    };

    // 5. LOGIKA ZA TABLICU
    const uniqueValues = useMemo(() => {
        const columns = ['ime', 'prezime', 'email'];
        const uniques = {};
        columns.forEach(col => {
            const values = korisnici
                .map(item => item[col])
                .filter(val => val !== null && val !== undefined && val !== '')
                .map(val => String(val));
            uniques[col] = [...new Set(values)].sort((a, b) => a.localeCompare(b));
        });
        return uniques;
    }, [korisnici]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let data = [...korisnici];
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                data = data.filter(item => String(item[key] || '') === filters[key]);
            }
        });
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
    }, [korisnici, filters, sortConfig]);

    // Pomoćna funkcija za lijep prikaz datuma
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) return <div className="p-4 text-slate-500">Učitavanje korisnika...</div>;
    if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Popis svih korisnika</h3>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    + Dodaj novog korisnika
                </button>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                            {[
                                { key: 'ime', label: 'Ime' },
                                { key: 'prezime', label: 'Prezime' },
                                { key: 'email', label: 'Email' }
                            ].map((col) => (
                                <th key={col.key} className="p-3 font-semibold text-slate-700 text-sm align-top min-w-[150px]">
                                    <div
                                        className="flex items-center gap-1 cursor-pointer hover:text-blue-600 mb-2 transition-colors select-none"
                                        onClick={() => requestSort(col.key)}
                                    >
                                        {col.label}
                                        <span className="text-xs text-slate-400">
                                            {sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                                        </span>
                                    </div>
                                    <select
                                        value={filters[col.key]}
                                        onChange={(e) => setFilters({ ...filters, [col.key]: e.target.value })}
                                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal shadow-sm bg-white text-slate-700 cursor-pointer"
                                    >
                                        <option value="">Sve</option>
                                        {uniqueValues[col.key]?.map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>
                            ))}
                            {/* Stupac za datum kreiranja bez filtera */}
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top">
                                <div className="mb-2 select-none">Kreiran na</div>
                            </th>
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top text-center w-28">
                                Akcije
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 text-sm font-medium text-slate-800">{item.ime}</td>
                                    <td className="p-3 text-sm text-slate-800">{item.prezime}</td>
                                    <td className="p-3 text-sm text-blue-600">{item.email}</td>
                                    <td className="p-3 text-sm text-slate-500">{formatDate(item.kreiran_na)}</td>
                                    <td className="p-3 text-sm text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer p-1" title="Uredi">✎</button>
                                            <button onClick={() => setDeleteAlert({ isOpen: true, id: item.id })} className="text-red-600 hover:text-red-800 font-medium cursor-pointer p-1" title="Obriši">🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">
                                    Nema pronađenih korisnika.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL ZA CREATE / UPDATE */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            {modalMode === 'create' ? 'Dodaj novog korisnika' : 'Uredi korisnika'}
                        </h2>

                        {/* DODANO: Prikaz greške s backenda */}
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Ime <span className="text-red-500">*</span></label>
                                    <input type="text" required value={formData.ime} onChange={(e) => setFormData({ ...formData, ime: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Prezime <span className="text-red-500">*</span></label>
                                    <input type="text" required value={formData.prezime} onChange={(e) => setFormData({ ...formData, prezime: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Email adresa <span className="text-red-500">*</span></label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Lozinka {modalMode === 'create' ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Ostavite prazno ako ne mijenjate)</span>}
                                </label>
                                <input type="password" required={modalMode === 'create'} value={formData.lozinka} onChange={(e) => setFormData({ ...formData, lozinka: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                    Odustani
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer">
                                    {modalMode === 'create' ? 'Spremi korisnika' : 'Spremi izmjene'}
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
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Brisanje korisnika</h2>
                        <p className="text-slate-500 mb-6">Jeste li sigurni da želite obrisati ovog korisnika? Ova akcija se ne može poništiti.</p>
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

export default UsersTable;