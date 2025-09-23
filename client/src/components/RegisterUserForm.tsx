import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from './api';

interface RegisterUserFormProps {
  token: string;
  API_URL: string;
}

const RegisterUserForm: React.FC<RegisterUserFormProps> = ({ token, API_URL }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    branch: [] as string[],
    role: '',
    email: '',
    password: ''
  });
  const [branches, setBranches] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      setError('');
      try {
        const res = await authenticatedFetch(`${API_URL}/users/dropdowns`);
        if (!res.ok) throw new Error('Dropdowns konnten nicht geladen werden');
        const data = await res.json();
        setBranches(data.branches);
        setRoles(data.roles);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchDropdowns();
  }, [API_URL, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'branch') {
      const options = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => o.value);
      setForm({ ...form, branch: options });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await authenticatedFetch(`${API_URL}/users`, {
        method: 'POST',
        body: JSON.stringify({ ...form, branch: form.branch })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Fehler beim Anlegen des Benutzers');
      }
      setSuccess('Benutzer erfolgreich angelegt!');
      setForm({ firstName: '', lastName: '', branch: [], role: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Neuen Benutzer anlegen</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vorname</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Nachname</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Filiale</label>
          <select name="branch" multiple value={form.branch} onChange={handleChange} required style={{ minHeight: 60 }}>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div style={{fontSize: '0.85em', color: '#888', marginTop: 2}}>Mehrfachauswahl möglich</div>
        </div>
        <div className="form-group">
          <label>Rolle</label>
          <select name="role" value={form.role} onChange={handleChange} required>
            <option value="">Bitte wählen</option>
            {roles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Passwort</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Anlegen...' : 'Benutzer anlegen'}</button>
      </form>
    </div>
  );
};

export default RegisterUserForm;
