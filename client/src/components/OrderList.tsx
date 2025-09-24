import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticatedFetch } from './api';
import '../App.css';

interface OrderListProps { token: string | null; API_URL: string; role?: string | null; }
interface Order { id: number; customerFirstName: string; customerLastName: string; orderNumber: string; status: string; completionDate: string; branch: string; }

// Confirmation Modal Component
const ConfirmationModal: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void; }> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Bestätigung</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button onClick={onCancel} className="secondary-button">Abbrechen</button>
                    <button onClick={onConfirm} className="danger-button">Löschen</button>
                </div>
            </div>
        </div>
    );
};

const OrderList: React.FC<OrderListProps> = ({ token, API_URL, role }) => {
    const navigate = useNavigate();
    const [completeLoading, setCompleteLoading] = useState<number | null>(null);
    const handleComplete = async (orderId: number) => {
        setCompleteLoading(orderId);
        setError('');
        try {
            const response = await authenticatedFetch(`${API_URL}/orders/${orderId}/complete`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Abschließen fehlgeschlagen.');
            setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'abgeschlossen' } : o));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCompleteLoading(null);
        }
    };
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await authenticatedFetch(`${API_URL}/orders`);
                if (!response.ok) throw new Error('Fehler beim Laden der Aufträge');
                const data = await response.json();
                setOrders(data.data);
            } catch (err: any) { setError(err.message); }
            finally { setLoading(false); }
        };
        if (token) fetchOrders();
    }, [token, API_URL]);

    const handleDelete = async (orderId: number) => {
        try {
            const response = await authenticatedFetch(`${API_URL}/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Löschen fehlgeschlagen.');
            setOrders(orders.filter(order => order.id !== orderId));
            setShowDeleteModal(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const filteredOrders = useMemo(() => {
        // Zeige nur nicht-abgeschlossene Aufträge
        const openOrders = orders.filter(order => order.status !== 'abgeschlossen');
        if (!searchQuery) return openOrders;
        return openOrders.filter(order =>
            `${order.customerFirstName} ${order.customerLastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [orders, searchQuery]);

    if (loading) return <div>Lade Aufträge...</div>;

    return (
        <div className="form-container">
            {showDeleteModal && (
                <ConfirmationModal 
                    message={`Sind Sie sicher, dass Sie den Auftrag #${showDeleteModal} endgültig löschen möchten?`}
                    onConfirm={() => handleDelete(showDeleteModal)}
                    onCancel={() => setShowDeleteModal(null)}
                />
            )}
            <div className="order-list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2>Auftragsliste</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Suche nach Kunde oder Auftrags-NR..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                </div>
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
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <tr key={order.id} className="clickable-row" onClick={() => navigate(`/orders/${order.id}`)} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '0.75rem' }}>{order.id}</td>
                                <td style={{ padding: '0.75rem' }}>{order.customerFirstName} {order.customerLastName}</td>
                                <td style={{ padding: '0.75rem' }}>{order.orderNumber}</td>
                                <td style={{ padding: '0.75rem' }}>{order.status}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    {order.completionDate ? new Date(order.completionDate).toLocaleDateString('de-DE') : '-'}
                                </td>
                                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                    <Link to={`/orders/${order.id}`} className="secondary-button" style={{padding: '0.4rem 0.8rem', textDecoration: 'none'}}>Ansehen</Link>
                                    {role === 'admin' && <button onClick={() => setShowDeleteModal(order.id)} className="danger-button" style={{padding: '0.4rem 0.8rem'}}>Löschen</button>}
                                    {role === 'admin' && order.status !== 'abgeschlossen' && (
                                        <button
                                            className="primary-button"
                                            style={{padding: '0.4rem 0.8rem'}}
                                            onClick={() => handleComplete(order.id)}
                                            disabled={completeLoading === order.id}
                                        >
                                            {completeLoading === order.id ? 'Wird abgeschlossen...' : 'Abschließen'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} style={{textAlign: 'center', padding: '1rem'}}>Keine Aufträge gefunden.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default OrderList;
