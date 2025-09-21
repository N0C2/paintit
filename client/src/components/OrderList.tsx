import React, { useState, useEffect } from 'react';
import '../App.css';

interface OrderListProps {
    token: string | null;
    API_URL: string;
}

const OrderList: React.FC<OrderListProps> = ({ token, API_URL }) => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_URL}/orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Fehler beim Laden der Aufträge');
                }
                const data = await response.json();
                setOrders(data.data);
            } catch (err: any) {
                setError(err.message);
            }
        };

        if (token) {
            fetchOrders();
        }
    }, [token, API_URL]);

    return (
        <div className="form-container">
            <h2>Auftragsliste</h2>
            {error && <p className="error">{error}</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Kunde</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Auftrags-NR</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fertigstellung</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Filiale</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order: any) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '0.75rem' }}>{order.id}</td>
                            <td style={{ padding: '0.75rem' }}>{order.customerFirstName} {order.customerLastName}</td>
                            <td style={{ padding: '0.75rem' }}>{order.orderNumber}</td>
                            <td style={{ padding: '0.75rem' }}>{order.status}</td>
                            <td style={{ padding: '0.75rem' }}>
                                {order.completionDate ? new Date(order.completionDate).toLocaleDateString('de-DE') : '-'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>{order.branch}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderList;

