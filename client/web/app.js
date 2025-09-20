const API = localStorage.getItem('API_URL') || 'http://localhost:4000/api';
const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

// Views
const formView = $('#form-view');
const listView = $('#list-view');
const loginView = $('#login-view');

const token = () => localStorage.getItem('token');
const setAuthHeaders = (opts={}) => ({
  ...opts,
  headers: { 'Content-Type': 'application/json', ...(opts.headers||{}), ...(token()?{ Authorization: 'Bearer '+token() }:{}) }
});

function show(view) {
  for (const el of [formView, listView, loginView]) el.classList.add('hidden');
  view.classList.remove('hidden');
}

// Sidebar
$('#btn-new').onclick = () => show(formView);
$('#btn-list').onclick = () => { loadOrders(); show(listView); };
$('#btn-logout').onclick = () => { localStorage.removeItem('token'); updateTopbar(); show(loginView); };

function updateTopbar() {
  const user = JSON.parse(localStorage.getItem('user')||'null');
  $('#top-user').textContent = user? user.name : '–';
  $('#top-branch').textContent = user? user.branch : '–';
  $('#branch-input').value = user?.branch || '';
}

// Login
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target); const body = Object.fromEntries(fd.entries());
  const r = await fetch(`${API}/login`, setAuthHeaders({ method:'POST', body: JSON.stringify(body) }));
  const data = await r.json();
  if (r.ok) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); updateTopbar(); show(formView); }
  else alert(data.message || 'Login fehlgeschlagen');
});

// Auftrag speichern
$('#order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target); const body = Object.fromEntries(fd.entries());
  const r = await fetch(`${API}/orders`, setAuthHeaders({ method:'POST', body: JSON.stringify(body) }));
  const data = await r.json();
  $('#save-msg').textContent = r.ok ? `Gespeichert (#${data.id})` : (data.message || 'Fehler');
  if (r.ok) e.target.reset();
});

// Liste laden
async function loadOrders() {
  const q = $('#search').value; const branch = $('#filter-branch').value;
  const params = new URLSearchParams(); if (q) params.set('q', q); if (branch) params.set('branch', branch);
  const r = await fetch(`${API}/orders?${params.toString()}`, setAuthHeaders());
  const rows = await r.json();
  const tbody = $('#orders-table tbody'); tbody.innerHTML='';
  const set = new Set();
  for (const row of rows) set.add(row.branch);
  const sel = $('#filter-branch'); sel.innerHTML = '<option value="">Alle Filialen</option>' + [...set].map(b=>`<option>${b}</option>`).join('');
  rows.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${o.order_no}</td><td>${o.vin}</td><td>${o.paint_code}</td><td>${o.branch}</td><td>${o.completion_date||''}</td><td>${o.current_status||''}</td>`;
    tbody.appendChild(tr);
  });
}

// Startzustand
if (token()) { updateTopbar(); show(formView); } else { show(loginView); }
