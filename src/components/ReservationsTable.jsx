import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';

const ReservationsTable = () => {
    const [rezervacije, setRezervacije] = useState([]);
    const [korisnici, setKorisnici] = useState([]);
    const [resursi, setResursi] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState(null);

    const [filters, setFilters] = useState({
        korisnik_ime: '',
        resurs_naziv: '',
        pocetak_prikaz: '',
        zavrsetak_prikaz: '',
        status: '',
        napomena_admina: ''
    });

    const initialFormState = {
        korisnik_id: '',
        resurs_id: '',
        pocetak_datum: '',
        pocetak_vrijeme: '',
        zavrsetak_datum: '',
        zavrsetak_vrijeme: '',
        status: 'aktivna',
        napomena_admina: ''
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState(initialFormState);
    const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, id: null });

    const parseDateString = (dateString) => {
        if (!dateString) return { datum: '', vrijeme: '' };
        const d = new Date(dateString);
        const pad = (n) => n.toString().padStart(2, '0');
        return {
            datum: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
            vrijeme: `${pad(d.getHours())}:${pad(d.getMinutes())}`
        };
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

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
                const [rezRes, korRes, resRes] = await Promise.all([
                    api.get('/api/rezervacije'),
                    api.get('/api/korisnici'),
                    api.get('/api/resursi')
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

    const enrichedRezervacije = useMemo(() => {
        return rezervacije.map(rez => {
            const user = korisnici.find(k => k.id === rez.korisnik_id);
            const resurs = resursi.find(r => r.id === rez.resurs_id);

            return {
                ...rez,
                korisnik_ime: user ? `${user.ime} ${user.prezime}` : `ID: ${rez.korisnik_id}`,
                resurs_naziv: resurs ? resurs.naziv || resurs.ime || `Resurs ${rez.resurs_id}` : `ID: ${rez.resurs_id}`,
                pocetak_prikaz: formatDisplayDate(rez.vrijeme_pocetka),
                zavrsetak_prikaz: formatDisplayDate(rez.vrijeme_zavrsetka),
                napomena_admina: rez.napomena_admina || '-'
            };
        });
    }, [rezervacije, korisnici, resursi]);

    const openCreateModal = () => {
        setModalMode('create');
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        const pocetak = parseDateString(item.vrijeme_pocetka);
        const zavrsetak = parseDateString(item.vrijeme_zavrsetka);

        setFormData({
            id: item.id,
            korisnik_id: item.korisnik_id,
            resurs_id: item.resurs_id,
            pocetak_datum: pocetak.datum,
            pocetak_vrijeme: pocetak.vrijeme,
            zavrsetak_datum: zavrsetak.datum,
            zavrsetak_vrijeme: zavrsetak.vrijeme,
            status: item.status,
            napomena_admina: item.napomena_admina === '-' ? '' : item.napomena_admina
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                korisnik_id: formData.korisnik_id,
                resurs_id: formData.resurs_id,
                vrijeme_pocetka: `${formData.pocetak_datum} ${formData.pocetak_vrijeme}:00`,
                vrijeme_zavrsetka: `${formData.zavrsetak_datum} ${formData.zavrsetak_vrijeme}:00`,
                status: formData.status,
                napomena_admina: formData.napomena_admina || null
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

            if (err.response && err.response.data && err.response.data.greska) {
                const porukaGreske = err.response.data.greska;
                const razlogZabrane = err.response.data.razlog;

                if (razlogZabrane) {
                    alert(`${porukaGreske}\nRazlog: ${razlogZabrane}`);
                } else {
                    alert(porukaGreske);
                }
            } else {
                alert('Došlo je do neočekivane greške prilikom spremanja rezervacije.');
            }
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

    const uniqueValues = useMemo(() => {
        const columns = ['korisnik_ime', 'resurs_naziv', 'pocetak_prikaz', 'zavrsetak_prikaz', 'status', 'napomena_admina'];
        const uniques = {};
        columns.forEach(col => {
            const values = enrichedRezervacije
                .map(item => item[col])
                .filter(val => val !== null && val !== undefined && val !== '')
                .map(val => String(val));
            uniques[col] = [...new Set(values)].sort((a, b) => a.localeCompare(b));
        });
        return uniques;
    }, [enrichedRezervacije]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let data = [...enrichedRezervacije];

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                data = data.filter(item => String(item[key] || '') === filters[key]);
            }
        });

        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'pocetak_prikaz') {
                    aValue = new Date(a.vrijeme_pocetka).getTime();
                    bValue = new Date(b.vrijeme_pocetka).getTime();
                } else if (sortConfig.key === 'zavrsetak_prikaz') {
                    aValue = new Date(a.vrijeme_zavrsetka).getTime();
                    bValue = new Date(b.vrijeme_zavrsetka).getTime();
                }

                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [enrichedRezervacije, filters, sortConfig]);

    if (loading) return <div className="p-4 text-slate-500">Učitavanje rezervacija...</div>;
    if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Popis svih rezervacija</h3>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    + Dodaj novu rezervaciju
                </button>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                            {[
                                { key: 'korisnik_ime', label: 'Korisnik' },
                                { key: 'resurs_naziv', label: 'Resurs' },
                                { key: 'pocetak_prikaz', label: 'Početak' },
                                { key: 'zavrsetak_prikaz', label: 'Završetak' },
                                { key: 'napomena_admina', label: 'Napomena' },
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
                                    <select
                                        value={filters[col.key]}
                                        onChange={(e) => setFilters({ ...filters, [col.key]: e.target.value })}
                                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal shadow-sm bg-white text-slate-700 cursor-pointer"
                                    >
                                        <option value="">Sve</option>
                                        {uniqueValues[col.key]?.map((val) => (
                                            <option key={val} value={val}>
                                                {val === '-' && col.key === 'napomena_admina' ? 'Bez napomene' : val}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                            ))}
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top text-center w-28">
                                Akcije
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 text-sm font-medium text-slate-800">{item.korisnik_ime}</td>
                                    <td className="p-3 text-sm text-slate-600">{item.resurs_naziv}</td>
                                    <td className="p-3 text-sm text-slate-600 whitespace-nowrap">{item.pocetak_prikaz}</td>
                                    <td className="p-3 text-sm text-slate-600 whitespace-nowrap">{item.zavrsetak_prikaz}</td>
                                    <td className="p-3 text-sm text-slate-500 max-w-[150px] truncate" title={item.napomena_admina !== '-' ? item.napomena_admina : ''}>
                                        {item.napomena_admina}
                                    </td>
                                    <td className="p-3 text-sm">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${item.status === 'aktivna' ? 'bg-emerald-100 text-emerald-700' :
                                                item.status === 'zavrsena' ? 'bg-slate-200 text-slate-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-center">
                                        <div className="flex justify-center gap-2">
                                            {item.status === 'aktivna' ? (
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer p-1"
                                                    title="Uredi"
                                                >
                                                    ✎
                                                </button>
                                            ) : (
                                                <span className="p-1 w-[28px] inline-block"></span>
                                            )}
                                            <button
                                                onClick={() => setDeleteAlert({ isOpen: true, id: item.id })}
                                                className="text-red-600 hover:text-red-800 font-medium cursor-pointer p-1"
                                                title="Obriši"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500">
                                    Nema pronađenih rezervacija.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            {modalMode === 'create' ? 'Dodaj novu rezervaciju' : 'Uredi rezervaciju'}
                        </h2>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Korisnik <span className="text-red-500">*</span></label>
                                    <select required value={formData.korisnik_id} onChange={(e) => setFormData({ ...formData, korisnik_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="" disabled>Odaberi korisnika...</option>
                                        {korisnici.map(k => (
                                            <option key={k.id} value={k.id}>{k.ime} {k.prezime} ({k.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Resurs <span className="text-red-500">*</span></label>
                                    <select required value={formData.resurs_id} onChange={(e) => setFormData({ ...formData, resurs_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="" disabled>Odaberi resurs...</option>
                                        {resursi.map(r => (
                                            <option key={r.id} value={r.id}>{r.naziv || r.ime || `Resurs ${r.id}`}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <label className="block text-sm font-bold text-slate-800 mb-2">Početak rezervacije <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Datum</label>
                                        <input type="date" required value={formData.pocetak_datum} onChange={(e) => setFormData({ ...formData, pocetak_datum: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Vrijeme</label>
                                        <input type="time" required value={formData.pocetak_vrijeme} onChange={(e) => setFormData({ ...formData, pocetak_vrijeme: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <label className="block text-sm font-bold text-slate-800 mb-2">Završetak rezervacije <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Datum</label>
                                        <input type="date" required value={formData.zavrsetak_datum} onChange={(e) => setFormData({ ...formData, zavrsetak_datum: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Vrijeme</label>
                                        <input type="time" required value={formData.zavrsetak_vrijeme} onChange={(e) => setFormData({ ...formData, zavrsetak_vrijeme: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                                <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="aktivna">Aktivna</option>
                                    <option value="zavrsena">Završena</option>
                                    <option value="otkazana">Otkazana</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Napomena administratora</label>
                                <textarea rows="2" value={formData.napomena_admina} onChange={(e) => setFormData({ ...formData, napomena_admina: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Opcionalno..."></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                    Odustani
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer">
                                    {modalMode === 'create' ? 'Spremi rezervaciju' : 'Spremi izmjene'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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