import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../App.css';

interface OrderItem {
    id: number;
    part: string;
    code: string;
    info: string;
    additional_info: string;
}

interface Order {
    id: number;
    orderNumber: string;
    customerFirstName: string;
    customerLastName: string;
    licensePlate: string;
    status: string;
    createdAt: string;
    completionDate?: string;
    previousCompletionDate?: string;
    branchName?: string;
    vin?: string;
    paintNumber?: string;
    additionalOrderInfo?: string;
    items?: OrderItem[];
}

interface OrderDetailViewProps {
    token: string;
    API_URL: string;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ token, API_URL }) => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Auftrag konnte nicht geladen werden.');
                }
                const data = await response.json();
                setOrder(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, token, API_URL]);

    if (loading) return <div className="container"><h2>Lade Auftragsdetails...</h2></div>;
    if (error) return <div className="container"><p className="error">{error}</p></div>;
    if (!order) return <div className="container"><h2>Auftrag nicht gefunden.</h2></div>;

    return (
        <div className="container">
            <h2>Auftragsdetails: {order.orderNumber}</h2>
            <div className="order-details-grid">
                <div className="order-details-card">
                    <h3>Allgemeine Informationen</h3>
                    <p><strong>Kunde:</strong> {order.customerFirstName} {order.customerLastName}</p>
                    <p><strong>Kennzeichen:</strong> {order.licensePlate || 'N/A'}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Filiale:</strong> {order.branchName || 'N/A'}</p>
                    <p><strong>Erstellt am:</strong> {new Date(order.createdAt).toLocaleDateString('de-DE')}</p>
                    {order.completionDate && <p><strong>Fertigstellung:</strong> {new Date(order.completionDate).toLocaleDateString('de-DE')}</p>}
                    {order.previousCompletionDate && <p><strong>Vorherige Termine:</strong> {order.previousCompletionDate}</p>}
                </div>
                <div className="order-details-card">
                    <h3>Fahrzeug- & Auftragsdaten</h3>
                    <p><strong>Fahrgestell-NR (VIN):</strong> {order.vin || 'N/A'}</p>
                    <p><strong>Lack-NR:</strong> {order.paintNumber || 'N/A'}</p>
                    {order.additionalOrderInfo && <p><strong>Zusatzinformationen:</strong> {order.additionalOrderInfo}</p>}
                </div>
            </div>

            {order.items && order.items.length > 0 && (
                <div className="order-details-card" style={{ marginTop: '1.5rem' }}>
                    <h3>Datensätze</h3>
                    <table className="item-table">
                        <thead><tr><th>Teil</th><th>Code</th><th>Info</th><th>Zusatzinfo</th></tr></thead>
                        <tbody>
                            {order.items.map(item => (
                                <tr key={item.id}><td>{item.part}</td><td>{item.code}</td><td>{item.info}</td><td>{item.additional_info}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="button-group" style={{ marginTop: '1.5rem' }}>
                <button onClick={() => navigate('/orders')} className="secondary-button">Zurück zur Liste</button>
                <Link to={`/orders/${order.id}/edit`} className="primary-button">Auftrag bearbeiten</Link>
            </div>
        </div>
    );
};

export default OrderDetailView;