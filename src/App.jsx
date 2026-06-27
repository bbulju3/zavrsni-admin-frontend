import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; // Uvozimo naš novi Login ekran

// Za sada radimo privremeni (dummy) Dashboard ekran unutar iste datoteke, 
// kasnije ćemo ga prebaciti u zasebnu datoteku kao i Login.
const Dashboard = () => (
    <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Dobrodošli u Admin Panel</h1>
        <p>Uspješno ste prijavljeni. Ovdje će biti tablice s resursima i korisnicima.</p>
        <button
            onClick={() => {
                localStorage.removeItem('adminToken'); // Brisanje tokena za odjavu
                window.location.href = '/login'; // Vraćanje na login
            }}
            style={{ padding: '10px', marginTop: '20px', cursor: 'pointer' }}
        >
            Odjava
        </button>
    </div>
);

function App() {
    return (
        // Router mora obavijati cijelu aplikaciju da bi navigacija radila
        <Router>
            <Routes>
                {/* Ruta za login */}
                <Route path="/login" element={<Login />} />

                {/* Ruta za glavni ekran (Dashboard) */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Ako netko otvori samo "/", automatski ga preusmjeravamo na login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;