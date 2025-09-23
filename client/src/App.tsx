import React, { useState, useEffect } from 'react';

// Suppress React Router v7 future flag warnings (Vite/React)
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    const origWarn = console.warn;
    console.warn = function (...args) {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('React Router Future Flag Warning:')
        ) {
            return;
        }
        origWarn.apply(console, args);
    };
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Setup from './components/Setup';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import NewOrderForm from './components/NewOrderForm';
import OrderList from './components/OrderList';
import EditOrderForm from './components/EditOrderForm';
import RegisterUserForm from './components/RegisterUserForm';
import UserManagement from './components/UserManagement';
import CompletedOrderList from './components/CompletedOrderList';

const App: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    // API-URL über Umgebungsvariable (VITE_API_URL) konfigurierbar, Fallback auf relativen Pfad
    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        const checkStatusAndToken = async () => {
            try {
                const response = await fetch(`${API_URL}/status`);
                const data = await response.json();
                setNeedsSetup(!data.setupComplete);
                const storedToken = localStorage.getItem('authToken');
                if (storedToken) {
                    setToken(storedToken);
                    // Rolle aus JWT extrahieren
                    const payload = JSON.parse(atob(storedToken.split('.')[1]));
                    setRole(payload.role || null);
                }
            } catch (err) {
                console.error("Failed to connect to backend:", err);
                setNeedsSetup(true); // Assume setup is needed if backend is unreachable
            } finally {
                setLoading(false);
            }
        };
        checkStatusAndToken();
    }, []);

    const handleLoginSuccess = (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        // Rolle aus JWT extrahieren
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        setRole(payload.role || null);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setRole(null);
    };

    if (loading) return <div className="login-container"><h1>Laden...</h1></div>;
    if (needsSetup) return <Setup API_URL={API_URL} />;
    if (!token) return <LoginForm onLoginSuccess={handleLoginSuccess} API_URL={API_URL} />;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout onLogout={handleLogout} role={role} />}>
                    <Route index element={<Navigate to="/orders/new" replace />} />
                    <Route path="orders" element={<OrderList token={token} API_URL={API_URL} role={role} />} />
                    <Route path="orders/completed" element={<CompletedOrderList token={token} API_URL={API_URL} role={role} />} />
                    <Route path="orders/new" element={<NewOrderForm token={token} API_URL={API_URL} />} />
                    <Route path="orders/:orderId/edit" element={<EditOrderForm token={token} API_URL={API_URL} />} />
                    {role === 'admin' && <Route path="users/new" element={<RegisterUserForm token={token!} API_URL={API_URL} />} />}
                    {role === 'admin' && <Route path="users/manage" element={<UserManagement token={token!} API_URL={API_URL} />} />}
                    <Route path="*" element={<Navigate to="/orders" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
export default App;
