import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';

const ResourcesTable = () => {
    const [resursi, setResursi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState(null);

    // State za filtere (prazan string znači da je odabrana opcija "Sve")
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

    // Dinamičko izvlačenje jedinstvenih vrijednosti za svaki stupac iz izvornih podataka
    const uniqueValues = useMemo(() => {
        const columns = ['naziv', 'tip', 'opis', 'kapacitet', 'status'];
        const uniques = {};

        columns.forEach(col => {
            const values = resursi
                .map(item => item[col])
                // Filtriramo null, undefined i prazne stringove kako nam se ne bi pojavile prazne opcije u dropdownu
                .filter(val => val !== null && val !== undefined && val !== '')
                .map(val => String(val));

            // Set automatski briše sve duplikate, a [...new Set] to vraća natrag u normalno polje (Array)
            uniques[col] = [...new Set(values)].sort((a, b) => {
                // Za kapacitet koristimo numeričko sortiranje kako bi opcije išle redom (1, 2, 10...)
                if (col === 'kapacitet') {
                    return (Number(a) || 0) - (Number(b) || 0);
                }
                // Za ostala tekstualna polja koristimo standardno abecedno sortiranje
                return a.localeCompare(b);
            });
        });

        return uniques;
    }, [resursi]);

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

    // Filtriranje i sortiranje podataka za prikaz u tablici
    const processedData = useMemo(() => {
        let data = [...resursi];

        // 1. Filtriranje - sada provjeravamo točnu jednakost jer imamo fiksne opcije
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                data = data.filter(item =>
                    // Pretvaramo u string radi sigurne usporedbe s vrijednošću iz <select> elementa
                    String(item[key] || '') === filters[key]
                );
            }
        });

        // 2. Sortiranje
        if (sortConfig !== null) {
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

                                {/* Zamijenjen <input> s modernim <select> padajućim izbornikom */}
                                <select
                                    value={filters[col.key]}
                                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal shadow-sm bg-white text-slate-700 cursor-pointer"
                                >
                                    <option value="">Sve</option>
                                    {uniqueValues[col.key]?.map((val) => (
                                        <option key={val} value={val}>
                                            {/* Ako se radi o stupcu 'tip', zamjenjujemo podvlake razmacima radi ljepšeg prikaza */}
                                            {col.key === 'tip' ? val.replace(/_/g, ' ') : val}
                                        </option>
                                    ))}
                                </select>
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
                                    {item.tip.replace(/_/g, ' ')}
                                </td>
                                <td className="p-3 text-sm text-slate-500 max-w-xs truncate" title={item.opis || ''}>
                                    {item.opis || '-'}
                                </td>
                                <td className="p-3 text-sm text-slate-700 text-center">
                                    {item.kapacitet !== null ? item.kapacitet : '-'}
                                </td>
                                <td className="p-3 text-sm">
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
                                Nema pronađenih resursa koji odgovaraju odabranim filterima.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ResourcesTable;