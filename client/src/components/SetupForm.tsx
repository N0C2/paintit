import { useState, FormEvent } from 'react';

export default function SetupForm({ onDone }: { onDone: () => void }) {
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());

    setMsg('Connecting...');

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      setMsg('Setup successful! Restarting...');
      setTimeout(onDone, 2000);
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Initial Setup</h2>
      <label>Datenbank Host
        <input name="dbHost" required />
      </label>
      <label>Datenbank Nutzer
        <input name="dbUser" required />
      </label>
      <label>Datenbank Passwort
        <input type="password" name="dbPass" />
      </label>
      <label>Datenbank Name
        <input name="dbName" defaultValue="paintit" required />
      </label>
      <h3>Admin-Konto</h3>
      <label>E-Mail
        <input name="adminEmail" type="email" required />
      </label>
      <label>Passwort
        <input name="adminPassword" type="password" required />
      </label>
      <button type="submit">Run Setup</button>
      <p>{msg}</p>
    </form>
  );
}
