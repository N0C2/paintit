import { useState } from 'react';
import { createOrder } from '../api';

export default function OrderForm() {
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());
    try {
      const res = await createOrder(body);
      setMsg('Gespeichert (#'+res.id+')');
      form.reset();
    } catch (err:any) { setMsg(err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Neuen Auftrag anlegen</h2>
      <div className="grid">
        <label>Fertigstellung
          <input type="date" name="completion_date" />
        </label>
        <label>Fahrgestell-NR
          <input name="vin" required />
        </label>
        <label>Auftrags-NR
          <input name="order_no" required />
        </label>
        <label>Lack-NR
          <input name="paint_code" required />
        </label>
        <label>Filiale
          <input name="branch" required />
        </label>
      </div>
      <h3>Daten Satz</h3>
      <div className="grid">
        <label>Teil
          <input name="part" placeholder="Kotflügel VL." />
        </label>
        <label>Variante
          <input name="variant" placeholder="-S2" />
        </label>
        <label className="full">Zusatzinfo
          <textarea name="extra_info" rows={3}></textarea>
        </label>
        <label className="full">Datensatz
          <input name="dataset" />
        </label>
      </div>
      <div className="actions">
        <button type="submit">Speichern</button>
        <span>{msg}</span>
      </div>
    </form>
  );
}
