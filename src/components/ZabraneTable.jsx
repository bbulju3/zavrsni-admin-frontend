import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';

const ZabraneTable = () => {
    // 1. STATE ZA PODATKE I TABLICU
    const [zabrane, setZabrane] = useState([]);
    const [korisnici, setKorisnici] = useState([]);
    const [resursi, setResursi] = useState([]);
    const [administratori, setAdministratori] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState(null);

    // Filteri za stupce
    const [filters, setFilters] = useState({
        korisnik_ime: '',
        administrator_ime: '',
        opseg_zabrane: '',
        razlog: '',
        status: ''
    });

    // 2. STATE ZA MODALNE PROZORE
    const initialFormState = {
        korisnik_id: '',
        administrator_id: '', 
        razina_zabrane: 'resurs', // 'resurs' ili 'tip' - pomoćni state za formu zbog CHECK constrainta
        resurs_id: '',
        tip_resursa: '',
        razlog: '',
        aktivna: true
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState(initialFormState);
    const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, id: null });

    // 3. DOHVAĆANJE PODATAKA
    const fetchZabrane = async () => {
        try {
            const response = await api.get('/api/zabrane');
            setZabrane(response.data);
        } catch (err) {
            console.error("Greška pri osvježavanju zabrana:", err);
        }
    };

    useEffect(() => {
        const initialLoad = async () => {
            try {
                const [zabRes, korRes, resRes, admRes] = await Promise.all([
                    api.get('/api/zabrane'),
                    api.get('/api/korisnici'),
                    api.get('/api/resursi'),
                    api.get('/api/administratori')
                ]);

                setZabrane(zabRes.data);
                setKorisnici(korRes.data);
                setResursi(resRes.data);
                setAdministratori(admRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Greška pri inicijalnom dohvaćanju:", err);
                setError('Ne mogu dohvatiti podatke o zabranama.');
                setLoading(false);
            }
        };
        initialLoad();
    }, []);

    // 4. ENRICHMENT (Spajanje ID-jeva s imenima)
    const enrichedZabrane = useMemo(() => {
        return zabrane.map(zab => {
            const user = korisnici.find(k => k.id === zab.korisnik_id);
            const admin = administratori.find(a => a.id === zab.administrator_id);
            const resurs = resursi.find(r => r.id === zab.resurs_id);

            // Određivanje teksta za opseg (bilo resurs ili tip)
            let opsegPrikaz = '-';
            if (zab.resurs_id) {
                opsegPrikaz = resurs ? `Resurs: ${resurs.naziv || resurs.ime}` : `Resurs ID: ${zab.resurs_id}`;
            } else if (zab.tip_resursa) {
                opsegPrikaz = `Tip: ${zab.tip_resursa.toUpperCase().replace(/_/g, ' ')}`;
            }

            return {
                ...zab,
                korisnik_ime: user ? `${user.ime} ${user.prezime}` : `Korisnik ID: ${zab.korisnik_id}`,
                administrator_ime: admin ? `${admin.ime} ${admin.prezime}` : `Admin ID: ${zab.administrator_id}`,
                opseg_zabrane: opsegPrikaz,
                status: zab.aktivna ? 'Aktivna' : 'Neaktivna'
            };
        });
    }, [zabrane, korisnici, resursi, administratori]);

    // 5. CRUD LOGIKA
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
            administrator_id: item.administrator_id,
            razina_zabrane: item.resurs_id ? 'resurs' : 'tip',
            resurs_id: item.resurs_id || '',
            tip_resursa: item.tip_resursa || '',
            razlog: item.razlog,
            aktivna: Boolean(item.aktivna)
        });
        setIsModalOpen(true);
    };

    // Pomoćna funkcija za izvlačenje ID-a iz JWT tokena
    const getLoggedAdminId = () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return null;
        try {
            // JWT token se sastoji od 3 dijela odvojena točkom. Payload je srednji dio.
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            // Ovisno o tome kako si nazvao ključ u payloadu na backendu (id, admin_id, sub...)
            return payload.id || payload.admin_id;
        } catch (e) {
            console.error("Greška pri dekodiranju tokena:", e);
            return null;
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Automatski dohvaćamo ID prijavljenog administratora
            const loggedAdminId = getLoggedAdminId();

            if (!loggedAdminId) {
                alert("Nije moguće utvrditi vaš identitet. Molimo prijavite se ponovno.");
                return;
            }

            const payload = {
                korisnik_id: formData.korisnik_id,
                administrator_id: loggedAdminId, // Ovdje ga automatski injektiramo!
                resurs_id: formData.razina_zabrane === 'resurs' ? formData.resurs_id : null,
                tip_resursa: formData.razina_zabrane === 'tip' ? formData.tip_resursa : null,
                razlog: formData.razlog,
                aktivna: formData.aktivna
            };

            if (modalMode === 'create') {
                await api.post('/api/zabrane', payload);
            } else if (modalMode === 'edit') {
                await api.put(`/api/zabrane/${formData.id}`, payload);
            }
            setIsModalOpen(false);
            fetchZabrane();
        } catch (err) {
            console.error("Greška pri spremanju zabrane:", err);
            if (err.response && err.response.data && err.response.data.greska) {
                alert(err.response.data.greska);
            } else {
                alert('Došlo je do greške prilikom spremanja zabrane.');
            }
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/zabrane/${deleteAlert.id}`);
            setDeleteAlert({ isOpen: false, id: null });
            fetchZabrane();
        } catch (err) {
            console.error("Greška pri brisanju zabrane:", err);
            alert('Došlo je do greške prilikom brisanja zabrane.');
        }
    };

    // 6. SORTIRANJE I FILTRIRANJE
    const uniqueValues = useMemo(() => {
        const columns = ['korisnik_ime', 'administrator_ime', 'opseg_zabrane', 'status'];
        const uniques = {};
        columns.forEach(col => {
            const values = enrichedZabrane.map(item => item[col]).filter(Boolean).map(String);
            uniques[col] = [...new Set(values)].sort((a, b) => a.localeCompare(b));
        });
        return uniques;
    }, [enrichedZabrane]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let data = [...enrichedZabrane];

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
    }, [enrichedZabrane, filters, sortConfig]);

    if (loading) return <div className="p-4 text-slate-500">Učitavanje zabrana pristupa...</div>;
    if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Popis zabrana pristupa</h3>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    + Dodaj novu zabranu
                </button>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                            {[
                                { key: 'korisnik_ime', label: 'Korisnik' },
                                { key: 'opseg_zabrane', label: 'Opseg zabrane' },
                                { key: 'razlog', label: 'Razlog' },
                                { key: 'administrator_ime', label: 'Izrekao admin' },
                                { key: 'status', label: 'Status' }
                            ].map((col) => (
                                <th key={col.key} className="p-3 font-semibold text-slate-700 text-sm align-top min-w-[140px]">
                                    <div
                                        className="flex items-center gap-1 cursor-pointer hover:text-blue-600 mb-2 transition-colors select-none"
                                        onClick={() => requestSort(col.key)}
                                    >
                                        {col.label}
                                        <span className="text-xs text-slate-400">
                                            {sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                                        </span>
                                    </div>
                                    {col.key !== 'razlog' ? (
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
                                    ) : (
                                        <div className="h-7"></div>
                                    )}
                                </th>
                            ))}
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top text-center w-28">Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 text-sm font-medium text-slate-800">{item.korisnik_ime}</td>
                                    <td className="p-3 text-sm text-slate-600 font-mono text-xs">{item.opseg_zabrane}</td>
                                    <td className="p-3 text-sm text-slate-600 max-w-[200px] truncate" title={item.razlog}>{item.razlog}</td>
                                    <td className="p-3 text-sm text-slate-500">{item.administrator_ime}</td>
                                    <td className="p-3 text-sm">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${item.aktivna ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.status}
                                        </span>
                                    </td>
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
                                <td colSpan="6" className="p-8 text-center text-slate-500">Nema pronađenih zabrana.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL ZA CREATE / UPDATE */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            {modalMode === 'create' ? 'Dodaj novu zabranu pristupa' : 'Uredi zabranu pristupa'}
                        </h2>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Korisnik <span className="text-red-500">*</span></label>
                                    <select required value={formData.korisnik_id} onChange={(e) => setFormData({ ...formData, korisnik_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                        <option value="" disabled>Odaberi korisnika...</option>
                                        {korisnici.map(k => <option key={k.id} value={k.id}>{k.ime} {k.prezime} ({k.email})</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* LOGIKA ZA POŠTIVANJE CHECK CONSTRAINTA */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <label className="block text-sm font-bold text-slate-800">Razina/Opseg zabrane <span className="text-red-500">*</span></label>
                                <div className="flex gap-4 text-sm mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                        <input type="radio" name="razina_zabrane" value="resurs" checked={formData.razina_zabrane === 'resurs'} onChange={() => setFormData({ ...formData, razina_zabrane: 'resurs', tip_resursa: '' })} />
                                        Specifičan resurs
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                        <input type="radio" name="razina_zabrane" value="tip" checked={formData.razina_zabrane === 'tip'} onChange={() => setFormData({ ...formData, razina_zabrane: 'tip', resurs_id: '' })} />
                                        Cijeli tip resursa
                                    </label>
                                </div>

                                {formData.razina_zabrane === 'resurs' ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Odaberi resurs</label>
                                        <select required={formData.razina_zabrane === 'resurs'} value={formData.resurs_id} onChange={(e) => setFormData({ ...formData, resurs_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                            <option value="" disabled>Odaberi resurs...</option>
                                            {resursi.map(r => <option key={r.id} value={r.id}>{r.naziv || r.ime} (ID: {r.id})</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Odaberi tip resursa</label>
                                        <select required={formData.razina_zabrane === 'tip'} value={formData.tip_resursa} onChange={(e) => setFormData({ ...formData, tip_resursa: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                            <option value="" disabled>Odaberi tip...</option>
                                            <option value="prostor">Prostor</option>
                                            <option value="oprema">Oprema</option>
                                            <option value="vozilo">Vozilo</option>
                                            <option value="prostor_s_opremom">Prostor s opremom</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Razlog zabrane <span className="text-red-500">*</span></label>
                                <textarea required rows="3" value={formData.razlog} onChange={(e) => setFormData({ ...formData, razlog: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none text-sm" placeholder="Navedite službeni razlog zabrane pristupa..."></textarea>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="aktivna" checked={formData.aktivna} onChange={(e) => setFormData({ ...formData, aktivna: e.target.checked })} className="w-4 h-4 text-blue-600 border-slate-300 rounded" />
                                <label htmlFor="aktivna" className="text-sm font-medium text-slate-700 cursor-pointer">Zabrana je trenutno aktivna</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm cursor-pointer">Odustani</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm cursor-pointer">
                                    {modalMode === 'create' ? 'Kreiraj zabranu' : 'Spremi izmjene'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ZA BRISANJE */}
            {deleteAlert.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Uklanjanje zabrane</h2>
                        <p className="text-slate-500 mb-6 text-sm">Jeste li sigurni da želite trajno obrisati zapis o ovoj zabrani? Ova akcija briše povijest ove zabrane.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteAlert({ isOpen: false, id: null })} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm cursor-pointer w-full">Odustani</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm shadow-sm cursor-pointer w-full">Obriši</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZabraneTable;