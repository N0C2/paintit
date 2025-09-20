const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function token() { return localStorage.getItem('token'); }
function headers() {
  return {
    'Content-Type': 'application/json',
    ...(token() ? { Authorization: 'Bearer ' + token() } : {})
  };
}

export async function login(email: string, password: string) {
  const res = await fetch(API + '/login', { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function createOrder(data: any) {
  const res = await fetch(API + '/orders', { method: 'POST', headers: headers(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function listOrders() {
  const res = await fetch(API + '/orders', { headers: headers() });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}
