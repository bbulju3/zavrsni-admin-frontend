import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';

// Pretvoreno u pravu React komponentu koja koristi useNavigate za navigaciju
const Dashboard = () => {
    // useNavigate mora biti unutar komponente koja je obavijena Routerom
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken'); // Brisanje tokena
        navigate('/login'); // Prebacivanje na login ekran bez osvježavanja stranice
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Dobrodošli u Admin Panel</h1>
            <p>Uspješno ste prijavljeni. Ovdje će biti tablice s resursima i korisnicima.</p>
            <button
                onClick={handleLogout}
                style={{ padding: '10px', marginTop: '20px', cursor: 'pointer' }}
            >
                Odjava
            </button>
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