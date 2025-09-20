import React, { useState } from 'react';

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://192.168.178.49:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // Login successful
        onSuccess();
      } else {
        // Login failed
        alert('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Failed to login:', err);
      alert('Failed to connect to the server.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Dein Formular-HTML hier */}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Einloggen</button>
    </form>
  );
}
