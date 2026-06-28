import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';

const ResourcesTable = () => {
    // 1. STATE ZA PODATKE I TABLICU
    const [resursi, setResursi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState(null);
    const [filters, setFilters] = useState({ naziv: '', tip: '', opis: '', kapacitet: '', status: '' });

    // 2. STATE ZA MODALNE PROZORE (Pop-upove)
    const initialFormState = { naziv: '', tip: 'prostor', opis: '', kapacitet: '', status: 'aktivan' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' ili 'edit'
    const [formData, setFormData] = useState(initialFormState);

    // State za brisanje
    const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, id: null });

    // 3. DOHVAĆANJE PODATAKA

    // Funkcija koju zovemo isključivo NAKON dodavanja, uređivanja ili brisanja kako bismo osvježili tablicu
    const fetchResursi = async () => {
        try {
            const response = await api.get('/api/resursi');
            setResursi(response.data);
        } catch (err) {
            console.error("Greška pri osvježavanju podataka:", err);
        }
    };

    // Inicijalno učitavanje čim se stranica otvori (odvojeno u vlastitu funkciju kako bi linter bio zadovoljan)
    useEffect(() => {
        const initialLoad = async () => {
            try {
                const response = await api.get('/api/resursi');
                setResursi(response.data);
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
        setFormData(initialFormState); // Čistimo formu
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setFormData({
            id: item.id,
            naziv: item.naziv,
            tip: item.tip,
            opis: item.opis || '',
            // Ako je kapacitet null, u formi prikazujemo prazan string
            kapacitet: item.kapacitet !== null ? item.kapacitet : '',
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Priprema podataka (pretvaramo prazan kapacitet u null kako baza zahtijeva)
        const payload = {
            ...formData,
            kapacitet: formData.kapacitet === '' ? null : Number(formData.kapacitet)
        };

        try {
            if (modalMode === 'create') {
                await api.post('/api/resursi', payload);
            } else if (modalMode === 'edit') {
                // Za update šaljemo PUT (ili POST ako je tvoj backend tako podešen) na rutu s ID-jem
                await api.put(`/api/resursi/${formData.id}`, payload);
            }
            setIsModalOpen(false);
            fetchResursi(); // Osvježi tablicu nakon uspješne akcije
        } catch (err) {
            console.error("Greška pri spremanju:", err);
            alert('Došlo je do greške prilikom spremanja resursa.');
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/resursi/${deleteAlert.id}`);
            setDeleteAlert({ isOpen: false, id: null });
            fetchResursi(); // Osvježi tablicu nakon brisanja
        } catch (err) {
            console.error("Greška pri brisanju:", err);
            alert('Došlo je do greške prilikom brisanja resursa.');
        }
    };

    // 5. LOGIKA ZA TABLICU
    const uniqueValues = useMemo(() => {
        const columns = ['naziv', 'tip', 'opis', 'kapacitet', 'status'];
        const uniques = {};
        columns.forEach(col => {
            const values = resursi
                .map(item => {
                    // Ako je kapacitet null, mapiramo ga u posebnu oznaku za filter
                    if (col === 'kapacitet' && item[col] === null) {
                        return 'bez_kapaciteta';
                    }
                    return item[col];
                })
                .filter(val => val !== null && val !== undefined && val !== '')
                .map(val => String(val));

            uniques[col] = [...new Set(values)].sort((a, b) => {
                if (col === 'kapacitet') {
                    // Postavljamo opciju "Bez kapaciteta" na vrh liste (odmah nakon "Sve")
                    if (a === 'bez_kapaciteta') return -1;
                    if (b === 'bez_kapaciteta') return 1;
                    return (Number(a) || 0) - (Number(b) || 0);
                }
                return a.localeCompare(b);
            });
        });
        return uniques;
    }, [resursi]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let data = [...resursi];
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                if (key === 'kapacitet' && filters[key] === 'bez_kapaciteta') {
                    // Ako je odabrano "Bez kapaciteta", prikazujemo samo one s null vrijednošću
                    data = data.filter(item => item[key] === null);
                } else {
                    data = data.filter(item => String(item[key] || '') === filters[key]);
                }
            }
        });

        if (sortConfig !== null) {
    // ... (ostatak tvoje logike za sortiranje ostaje potpuno isti)
            data.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (aValue === null) aValue = '';
                if (bValue === null) bValue = '';
                if (sortConfig.key === 'kapacitet') {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [resursi, filters, sortConfig]);

    if (loading) return <div className="p-4 text-slate-500">Učitavanje resursa...</div>;
    if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {/* Header tablice s prebačenim gumbom za dodavanje */}
            <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Popis svih resursa</h3>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    + Dodaj novi resurs
                </button>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                            {[
                                { key: 'naziv', label: 'Naziv' },
                                { key: 'tip', label: 'Tip' },
                                { key: 'opis', label: 'Opis' },
                                { key: 'kapacitet', label: 'Kapacitet' },
                                { key: 'status', label: 'Status' }
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
                                            <option key={val} value={val}>
                                                {col.key === 'tip'
                                                    ? val.replace(/_/g, ' ')
                                                    : (col.key === 'kapacitet' && val === 'bez_kapaciteta'
                                                        ? 'Bez kapaciteta'
                                                        : val)
                                                }
                                            </option>
                                        ))}
                                    </select>
                                </th>
                            ))}
                            {/* Stupac za Akcije */}
                            <th className="p-3 font-semibold text-slate-700 text-sm align-top text-center w-28">
                                Akcije
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 text-sm font-medium text-slate-800">{item.naziv}</td>
                                    <td className="p-3 text-sm text-slate-600 capitalize">{item.tip.replace(/_/g, ' ')}</td>
                                    <td className="p-3 text-sm text-slate-500 max-w-xs truncate" title={item.opis || ''}>{item.opis || '-'}</td>
                                    <td className="p-3 text-sm text-slate-700 text-center">{item.kapacitet !== null ? item.kapacitet : '-'}</td>
                                    <td className="p-3 text-sm">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${item.status === 'aktivan' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    {/* Gumbi za Edit i Delete */}
                                    <td className="p-3 text-sm text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer p-1"
                                                title="Uredi"
                                            >
                                                ✎
                                            </button>
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
                                <td colSpan="6" className="p-8 text-center text-slate-500">
                                    Nema pronađenih resursa.
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
                            {modalMode === 'create' ? 'Dodaj novi resurs' : 'Uredi resurs'}
                        </h2>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Naziv <span className="text-red-500">*</span></label>
                                <input type="text" required value={formData.naziv} onChange={(e) => setFormData({ ...formData, naziv: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tip <span className="text-red-500">*</span></label>
                                    <select required value={formData.tip} onChange={(e) => setFormData({ ...formData, tip: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="prostor">Prostor</option>
                                        <option value="oprema">Oprema</option>
                                        <option value="vozilo">Vozilo</option>
                                        <option value="prostor_s_opremom">Prostor s opremom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                                    <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="aktivan">Aktivan</option>
                                        <option value="odrzavanje">Održavanje</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kapacitet</label>
                                <input type="number" min="0" value={formData.kapacitet} onChange={(e) => setFormData({ ...formData, kapacitet: e.target.value })} placeholder="Opcionalno" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Opis</label>
                                <textarea rows="3" value={formData.opis} onChange={(e) => setFormData({ ...formData, opis: e.target.value })} placeholder="Opcionalno" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                    Odustani
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer">
                                    {modalMode === 'create' ? 'Spremi resurs' : 'Spremi izmjene'}
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
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Brisanje resursa</h2>
                        <p className="text-slate-500 mb-6">Jeste li sigurni da želite obrisati ovaj resurs? Ova akcija se ne može poništiti.</p>
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

export default ResourcesTable;