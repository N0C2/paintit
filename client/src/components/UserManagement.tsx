  const deleteUser = async (id: number) => {
    if (!window.confirm('Benutzer wirklich löschen?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Fehler beim Löschen');
      setSuccess('Benutzer gelöscht!');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  branches: string[];
}

interface UserManagementProps {
  token: string;
  API_URL: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ token, API_URL }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [branchesList, setBranchesList] = useState<string[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Fehler beim Laden der Benutzer');
      setUsers(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => { fetchUsers(); }, [API_URL, token]);
  useEffect(() => {
    // Lade alle Filialen für das Multi-Select
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${API_URL}/dropdowns/branch`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Fehler beim Laden der Filialen');
        setBranchesList(await res.json());
      } catch {
        setBranchesList([]);
      }
    };
    fetchBranches();
  }, [API_URL, token]);

  const startEdit = (user: User) => {
    setEditId(user.id);
    setEditData({ ...user });
    setSuccess('');
    setError('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/users/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      if (!res.ok) throw new Error('Fehler beim Speichern');
      setSuccess('Benutzer aktualisiert!');
      setEditId(null);
      setEditData({});
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Benutzerverwaltung</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Rolle</th>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>Filiale</th>
              {/* <th>Status</th> */}
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                {editId === user.id ? (
                  <>
                    <td><input name="email" value={editData.email || ''} onChange={handleEditChange} className="user-input" /></td>
                    <td>
                      <select name="role" value={editData.role || ''} onChange={handleEditChange} className="user-input">
                        <option value="admin">Admin</option>
                        <option value="Werkstattleiter">Werkstattleiter</option>
                        <option value="Lackierer">Lackierer</option>
                        <option value="Buchhaltung">Buchhaltung</option>
                        <option value="Mechaniker">Mechaniker</option>
                      </select>
                    </td>
                    <td><input name="firstName" value={editData.firstName || ''} onChange={handleEditChange} className="user-input" /></td>
                    <td><input name="lastName" value={editData.lastName || ''} onChange={handleEditChange} className="user-input" /></td>
                    <td>
                      <select
                        name="branch"
                        multiple
                        value={editData.branch ? (Array.isArray(editData.branch) ? editData.branch : [editData.branch]) : []}
                        onChange={e => {
                          const options = Array.from(e.target.selectedOptions).map(o => o.value);
                          setEditData({ ...editData, branch: options });
                        }}
                        className="user-input"
                        style={{ minWidth: 120, minHeight: 60 }}
                      >
                        {branchesList.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button className="primary-button small-btn" onClick={saveEdit} disabled={loading}>Speichern</button>
                      <button className="secondary-button small-btn" onClick={cancelEdit}>Abbrechen</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>
                      {user.branches && user.branches.length > 0 ? (
                        <div style={{ whiteSpace: 'pre-line' }}>{user.branches.join('\n')}</div>
                      ) : (
                        <span style={{ color: '#aaa' }}>-</span>
                      )}
                    </td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button className="secondary-button small-btn" onClick={() => startEdit(user)}>Bearbeiten</button>
                      <button className="secondary-button small-btn delete-btn" onClick={() => deleteUser(user.id)}>Löschen</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
