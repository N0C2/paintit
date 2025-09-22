import React, { useState } from 'react';
import '../App.css';

interface LoginFormProps {
    onLoginSuccess: (token: string) => void;
    API_URL: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, API_URL }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            onLoginSuccess(data.token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    {error && <p className="error">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Passwort</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="primary-button" disabled={loading}>
                        {loading ? 'Anmelden...' : 'Anmelden'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default LoginForm;
