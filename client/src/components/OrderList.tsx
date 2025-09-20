import { useEffect, useState } from 'react';
import { listOrders } from '../api';

export default function OrderList() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(()=>{ (async()=>{ setOrders(await listOrders()); })(); },[]);

  return (
    <div className="card">
      <h2>Aufträge</h2>
      <table>
        <thead>
          <tr>
            <th>Auftrags-NR</th>
            <th>VIN</th>
            <th>Lack</th>
            <th>Filiale</th>
            <th>Fertigstellung</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o=>(
            <tr key={o.id}>
              <td>{o.order_no}</td>
              <td>{o.vin}</td>
              <td>{o.paint_code}</td>
              <td>{o.branch}</td>
              <td>{o.completion_date||''}</td>
              <td>{o.current_status||''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
