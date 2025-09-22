import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

interface CompletedOrderListProps { token: string | null; API_URL: string; role?: string | null; }
interface Order { id: number; customerFirstName: string; customerLastName: string; orderNumber: string; status: string; completionDate: string; branch: string; }

const CompletedOrderList: React.FC<CompletedOrderListProps> = ({ token, API_URL, role }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_URL}/orders/completed`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Fehler beim Laden der Aufträge');
                const data = await response.json();
                setOrders(data.data);
            } catch (err: any) { setError(err.message); }
            finally { setLoading(false); }
        };
        if (token) fetchOrders();
    }, [token, API_URL]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery) return orders;
        return orders.filter(order =>
            `${order.customerFirstName} ${order.customerLastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [orders, searchQuery]);

    if (loading) return <div>Lade abgeschlossene Aufträge...</div>;

    return (
        <div className="form-container">
            <div className="order-list-header">
                <h2>Abgeschlossene Aufträge</h2>
                <input 
                    type="text" 
                    placeholder="Suche nach Kunde oder Auftrags-NR..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {error && <p className="error">{error}</p>}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Kunde</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Auftrags-NR</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fertigstellung</th>
                            {role === 'admin' && <th style={{ padding: '0.75rem', textAlign: 'left' }}>Aktionen</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '0.75rem' }}>{order.id}</td>
                                <td style={{ padding: '0.75rem' }}>{order.customerFirstName} {order.customerLastName}</td>
                                <td style={{ padding: '0.75rem' }}>{order.orderNumber}</td>
                                <td style={{ padding: '0.75rem' }}>{order.status}</td>
                                <td style={{ padding: '0.75rem' }}>{order.completionDate ? new Date(order.completionDate).toLocaleDateString('de-DE') : '-'}</td>
                                {role === 'admin' && (
                                    <td style={{ padding: '0.75rem' }}>
                                        <Link to={`/orders/${order.id}/edit`} className="secondary-button" style={{padding: '0.4rem 0.8rem', textDecoration: 'none'}}>Bearbeiten</Link>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr><td colSpan={role === 'admin' ? 6 : 5} style={{textAlign: 'center', padding: '1rem'}}>Keine Aufträge gefunden.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default CompletedOrderList;
