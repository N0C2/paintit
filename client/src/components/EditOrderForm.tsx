import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../App.css';

interface EditOrderFormProps { token: string | null; API_URL: string; }
interface OrderItem { part: string; code: string; info: string; additional_info: string; }
const initialFormState = { id: '', customerFirstName: '', customerLastName: '', completionDate: '', vin: '', orderNumber: '', paintNumber: '', branch: '', additionalOrderInfo: '' };

const EditOrderForm: React.FC<EditOrderFormProps> = ({ token, API_URL }) => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [formData, setFormData] = useState(initialFormState);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [dropdowns, setDropdowns] = useState({ branch: [], part: [], code: [], info: [] });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const fetchOrderData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Could not fetch order data.');
            const responsePayload = await response.json();
            const orderData = responsePayload.data;

            // Format the date to YYYY-MM-DD for the date input
            if (orderData.completionDate) {
                orderData.completionDate = new Date(orderData.completionDate).toISOString().split('T')[0];
            }
            setFormData(orderData);
            setItems(orderData.items || [{ part: '', code: '', info: '', additional_info: '' }]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPageLoading(false);
        }
    }, [orderId, token, API_URL]);

    useEffect(() => {
        const fetchDropdownData = async (type: string) => {
            const response = await fetch(`${API_URL}/dropdowns/${type}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`Could not fetch ${type}`);
            return await response.json();
        };
        const loadAllData = async () => {
            try {
                const [branch, part, code, info] = await Promise.all([ fetchDropdownData('branch'), fetchDropdownData('part'), fetchDropdownData('code'), fetchDropdownData('info') ]);
                setDropdowns({ branch, part, code, info });
                await fetchOrderData();
            } catch(err) { setError("Fehler beim Laden der Seitendaten."); setPageLoading(false); }
        };
        if (token) loadAllData();
    }, [token, API_URL, fetchOrderData]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [e.target.name]: e.target.value };
        setItems(newItems);
    };
    const addItem = () => setItems([...items, { part: '', code: '', info: '', additional_info: '' }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...formData, items })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update order.');
            setSuccess('Auftrag erfolgreich aktualisiert! Sie werden weitergeleitet...');
            setTimeout(() => navigate('/orders'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div>Lade Auftragsdaten...</div>;

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h2>Auftrag #{orderId} bearbeiten</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <div className="order-header-grid">
                     <div className="form-group"><label>Kunde Vorname</label><input name="customerFirstName" value={formData.customerFirstName} onChange={handleFormChange} required /></div>
                    <div className="form-group"><label>Kunde Nachname</label><input name="customerLastName" value={formData.customerLastName} onChange={handleFormChange} required /></div>
                    <div className="form-group"><label>Fertigstellungsdatum</label><input type="date" name="completionDate" value={formData.completionDate} onChange={handleFormChange} required /></div>
                    <div className="form-group"><label>Filiale</label><select name="branch" value={formData.branch} onChange={handleFormChange} required><option value="">-- Bitte auswählen --</option>{dropdowns.branch.map((b: string) => <option key={b} value={b}>{b}</option>)}</select></div>
                    <div className="form-group"><label>Fahrgestell-NR (VIN)</label><input name="vin" value={formData.vin} onChange={handleFormChange} /></div>
                    <div className="form-group"><label>Auftrags-NR</label><input name="orderNumber" value={formData.orderNumber} onChange={handleFormChange} /></div>
                    <div className="form-group"><label>Lack-NR</label><input name="paintNumber" value={formData.paintNumber} onChange={handleFormChange} /></div>
                </div>
                <div className="form-group"><label>Zusatzinformationen zum Auftrag</label><textarea name="additionalOrderInfo" value={formData.additionalOrderInfo} onChange={handleFormChange} /></div>
                <h3>Datensätze</h3>
                {items.map((item, index) => (
                    <div className="item-row" key={index}>
                        <select name="part" value={item.part} onChange={e => handleItemChange(index, e)}><option value="">-- Teil auswählen --</option>{dropdowns.part.map((p: string) => <option key={p} value={p}>{p}</option>)}</select>
                        <select name="code" value={item.code} onChange={e => handleItemChange(index, e)}><option value="">-- Code --</option>{dropdowns.code.map((c: string) => <option key={c} value={c}>{c}</option>)}</select>
                        <select name="info" value={item.info} onChange={e => handleItemChange(index, e)}><option value="">-- Info --</option>{dropdowns.info.map((i: string) => <option key={i} value={i}>{i}</option>)}</select>
                        <input name="additional_info" value={item.additional_info} onChange={e => handleItemChange(index, e)} placeholder="Zusatzinfo zum Datensatz" />
                        <button type="button" className="delete-button" onClick={() => removeItem(index)}>&times;</button>
                    </div>
                ))}
                <div className="form-actions">
                    <button type="button" className="secondary-button" onClick={addItem} disabled={loading}>Datensatz hinzufügen</button>
                    <button type="submit" className="primary-button" disabled={loading}>{loading ? 'Wird gespeichert...' : 'Änderungen speichern'}</button>
                </div>
            </form>
        </div>
    );
};
export default EditOrderForm;
