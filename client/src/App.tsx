import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Setup from './components/Setup';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import NewOrderForm from './components/NewOrderForm';
import OrderList from './components/OrderList';

const App: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const SERVER_IP = '192.168.178.49'; // Wichtig: IP deines Servers
    const API_URL = `http://${SERVER_IP}:3001/api`;

    useEffect(() => {
        const checkStatusAndToken = async () => {
            try {
                const response = await fetch(`http://${SERVER_IP}:3001/api/status`);
                const data = await response.json();
                setNeedsSetup(!data.setupComplete);

                const storedToken = localStorage.getItem('authToken');
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (err) {
                console.error("Server-Status konnte nicht geprüft werden.", err);
                setNeedsSetup(true);
            } finally {
                setLoading(false);
            }
        };
        checkStatusAndToken();
    }, []);

    const handleLoginSuccess = (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
    };

    if (loading) {
        return <div className="login-container"><h1>Laden...</h1></div>;
    }

    if (needsSetup) {
        return <Setup API_URL={API_URL} />;
    }

    if (!token) {
        return <LoginForm onLoginSuccess={handleLoginSuccess} API_URL={API_URL} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout onLogout={handleLogout} />}>
                    <Route index element={<NewOrderForm token={token} API_URL={API_URL} />} />
                    <Route path="orders" element={<OrderList token={token} API_URL={API_URL} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;

