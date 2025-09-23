import React, { useState } from 'react';
import '../App.css';

interface SetupProps { API_URL: string; }

const Setup: React.FC<SetupProps> = ({ API_URL }) => {
    const [formData, setFormData] = useState({ dbHost: '127.0.0.1', dbUser: '', dbPassword: '', dbName: '', adminEmail: '', adminPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const response = await fetch(`${API_URL}/setup/initialize`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Setup fehlgeschlagen.');
            setSuccess('Setup erfolgreich! Bitte lade die Seite neu, um dich anzumelden.');
        } catch (err: any) { 
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="form-container" style={{maxWidth: '600px'}}>
                <form onSubmit={handleSubmit}>
                    <h2>Anwendungs-Setup</h2>
                    <p style={{textAlign: 'center', marginBottom: '1.5rem'}}>Bitte gib die Zugangsdaten für die Datenbank und den Admin-Benutzer an.</p>
                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}
                    <h3>Datenbankverbindung</h3>
                    <div className="form-group"><label>Datenbank Host/IP</label><input name="dbHost" value={formData.dbHost} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Datenbank Benutzer</label><input name="dbUser" value={formData.dbUser} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Datenbank Passwort</label><input type="password" name="dbPassword" value={formData.dbPassword} onChange={handleChange} /></div>
                    <div className="form-group"><label>Datenbank Name</label><input name="dbName" value={formData.dbName} onChange={handleChange} required /></div>
                    <h3>Admin-Konto</h3>
                    <div className="form-group"><label>Admin Email</label><input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Admin Passwort</label><input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} required /></div>
                    <button type="submit" className="primary-button" style={{width: '100%', marginTop: '1rem'}} disabled={loading || !!success}>
                        {loading ? 'Wird eingerichtet...' : (success ? 'Abgeschlossen' : 'Setup abschließen')}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default Setup;