import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';

const ResourcesTable = () => {
    const [resursi, setResursi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [sortConfig, setSortConfig] = useState(null);

    // Filteri sada točno odgovaraju stupcima iz tvoje SQL skripte
    const [filters, setFilters] = useState({
        naziv: '',
        tip: '',
        opis: '',
        kapacitet: '',
        status: ''
    });

    useEffect(() => {
        const fetchResursi = async () => {
            try {
                // Tvoja potvrđena API ruta
                const response = await api.get('/api/resursi');
                setResursi(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Greška pri dohvaćanju:", err);
                setError('Ne mogu dohvatiti podatke s backenda.');
                setLoading(false);
            }
        };

        fetchResursi();
    }, []);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const processedData = useMemo(() => {
        let data = [...resursi];

        // 1. Filtriranje
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                data = data.filter(item =>
                    // Koristimo (item[key] || '') kako bismo izbjegli greške ako su opis ili kapacitet NULL u bazi
                    String(item[key] || '').toLowerCase().includes(filters[key].toLowerCase())
                );
            }
        });

        // 2. Sortiranje
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Pretvaranje null vrijednosti u prazan string za sigurno sortiranje teksta
                if (aValue === null) aValue = '';
                if (bValue === null) bValue = '';

                // Posebno pravilo za kapacitet kako bi se sortirao kao broj (npr. da 10 bude veće od 2, a ne obrnuto zbog abecede)
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
                            <th key={col.key} className="p-3 font-semibold text-slate-700 text-sm align-top">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-blue-600 mb-2 transition-colors select-none"
                                    onClick={() => requestSort(col.key)}
                                >
                                    {col.label}
                                    <span className="text-xs text-slate-400">
                                        {sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Filtriraj...`}
                                    value={filters[col.key]}
                                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal shadow-sm"
                                />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {processedData.length > 0 ? (
                        processedData.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-3 text-sm font-medium text-slate-800">{item.naziv}</td>
                                <td className="p-3 text-sm text-slate-600 capitalize">
                                    {/* Mijenjamo donju crtu u razmak za ljepši prikaz (npr. prostor_s_opremom -> prostor s opremom) */}
                                    {item.tip.replace(/_/g, ' ')}
                                </td>
                                {/* Ograničavamo širinu opisa kako ne bi razbio dizajn tablice ako je predugačak */}
                                <td className="p-3 text-sm text-slate-500 max-w-xs truncate" title={item.opis || ''}>
                                    {item.opis || '-'}
                                </td>
                                <td className="p-3 text-sm text-slate-700 text-center">
                                    {item.kapacitet !== null ? item.kapacitet : '-'}
                                </td>
                                <td className="p-3 text-sm">
                                    {/* Dinamične boje ovisno o statusu u bazi */}
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${item.status === 'aktivan' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-500">
                                Nema pronađenih resursa koji odgovaraju filterima.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ResourcesTable;