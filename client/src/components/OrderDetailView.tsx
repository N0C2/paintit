import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authenticatedFetch } from './api';
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
                const response = await authenticatedFetch(`${API_URL}/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error('Auftrag konnte nicht geladen werden.');
                }
                const result = await response.json();
                setOrder(result.data);
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Auftragsdetails: {order.orderNumber}</h2>
                <div className="button-group">
                    <button onClick={() => navigate('/orders')} className="btn btn-secondary">Zurück zur Liste</button>
                    <Link to={`/orders/${order.id}/edit`} className="btn btn-primary">Auftrag bearbeiten</Link>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Allgemeine Informationen</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Kunde:</strong> {order.customerFirstName} {order.customerLastName}</p>
                            <p><strong>Kennzeichen:</strong> {order.licensePlate || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className={`badge bg-primary`}>{order.status}</span></p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Filiale:</strong> {order.branchName || 'N/A'}</p>
                            <p><strong>Erstellt am:</strong> {new Date(order.createdAt).toLocaleDateString('de-DE')}</p>
                            {order.completionDate && <p><strong>Fertigstellung:</strong> {new Date(order.completionDate).toLocaleDateString('de-DE')}</p>}
                        </div>
                    </div>
                    {order.previousCompletionDate && <p><strong>Vorherige Termine:</strong> {order.previousCompletionDate}</p>}
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="card-title mb-0">Fahrzeug- & Auftragsdaten</h5>
                </div>
                <div className="card-body">
                    <p><strong>Fahrgestell-NR (VIN):</strong> {order.vin || 'N/A'}</p>
                    <p><strong>Lack-NR:</strong> {order.paintNumber || 'N/A'}</p>
                    {order.additionalOrderInfo && <p><strong>Zusatzinformationen:</strong> {order.additionalOrderInfo}</p>}
                </div>
            </div>

            {order.items && order.items.length > 0 && (
                <div className="card shadow-sm mt-4">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Positionen</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light"><tr><th>Teil</th><th>Code</th><th>Info</th><th>Zusatzinfo</th></tr></thead>
                            <tbody>
                                {order.items.map(item => (
                                    <tr key={item.id}><td>{item.part}</td><td>{item.code}</td><td>{item.info}</td><td>{item.additional_info}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailView;