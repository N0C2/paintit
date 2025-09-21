import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

interface NewOrderFormProps {
    token: string | null;
    API_URL: string;
}

interface OrderItem {
    part: string;
    code: string;
    info: string;
    additional_info: string;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ token, API_URL }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerFirstName: '',
        customerLastName: '',
        completionDate: '',
        vin: '',
        orderNumber: '',
        paintNumber: '',
        branch: '',
        additionalOrderInfo: '',
    });
    const [items, setItems] = useState<OrderItem[]>([{ part: '', code: '', info: '', additional_info: '' }]);
    const [dropdowns, setDropdowns] = useState({ branches: [], parts: [], codes: [], infos: [] });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchDropdownData = async (endpoint: string) => {
            try {
                const response = await fetch(`${API_URL}/${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`Could not fetch ${endpoint}`);
                return await response.json();
            } catch (err) {
                console.error(err);
                setError(`Fehler beim Laden der Dropdown-Daten: ${endpoint}`);
                return [];
            }
        };

        const loadAllData = async () => {
            const [branches, parts, codes, infos] = await Promise.all([
                fetchDropdownData('branches'),
                fetchDropdownData('parts'),
                fetchDropdownData('codes'),
                fetchDropdownData('infos'),
            ]);
            setDropdowns({ branches, parts, codes, infos });
        };

        if (token) {
            loadAllData();
        }
    }, [token, API_URL]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newItems = [...items];
        const { name, value } = e.target;
        newItems[index] = { ...newItems[index], [name]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { part: '', code: '', info: '', additional_info: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const payload = { ...formData, items };

        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to create order.');
            }
            setSuccess('Auftrag erfolgreich erstellt!');
            setTimeout(() => navigate('/orders'), 1500);

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h2>Neuen Auftrag erstellen</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <div className="order-header-grid">
                    <div className="form-group">
                        <label>Kunde Vorname</label>
                        <input name="customerFirstName" value={formData.customerFirstName} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Kunde Nachname</label>
                        <input name="customerLastName" value={formData.customerLastName} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Fertigstellungsdatum</label>
                        <input type="date" name="completionDate" value={formData.completionDate} onChange={handleFormChange} min={getMinDate()} required />
                    </div>
                    <div className="form-group">
                        <label>Filiale</label>
                        <select name="branch" value={formData.branch} onChange={handleFormChange} required>
                            <option value="">-- Bitte auswählen --</option>
                            {dropdowns.branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fahrgestell-NR (VIN)</label>
                        <input name="vin" value={formData.vin} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                        <label>Auftrags-NR</label>
                        <input name="orderNumber" value={formData.orderNumber} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                        <label>Lack-NR</label>
                        <input name="paintNumber" value={formData.paintNumber} onChange={handleFormChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Zusatzinformationen zum Auftrag</label>
                    <textarea name="additionalOrderInfo" value={formData.additionalOrderInfo} onChange={handleFormChange} />
                </div>

                <h3>Datensätze</h3>
                {items.map((item, index) => (
                    <div className="item-row" key={index}>
                        <select name="part" value={item.part} onChange={e => handleItemChange(index, e)}>
                            <option value="">-- Teil auswählen --</option>
                            {dropdowns.parts.map(part => <option key={part} value={part}>{part}</option>)}
                        </select>
                        <select name="code" value={item.code} onChange={e => handleItemChange(index, e)}>
                            <option value="">-- Code --</option>
                            {dropdowns.codes.map(code => <option key={code} value={code}>{code}</option>)}
                        </select>
                        <select name="info" value={item.info} onChange={e => handleItemChange(index, e)}>
                            <option value="">-- Info --</option>
                            {dropdowns.infos.map(info => <option key={info} value={info}>{info}</option>)}
                        </select>
                        <input name="additional_info" value={item.additional_info} onChange={e => handleItemChange(index, e)} placeholder="Zusatzinfo zum Datensatz" />
                        <button type="button" className="delete-button" onClick={() => removeItem(index)}>&times;</button>
                    </div>
                ))}

                <div className="form-actions">
                    <button type="button" className="secondary-button" onClick={addItem}>Datensatz hinzufügen</button>
                    <button type="submit" className="primary-button">Erstellen</button>
                </div>
            </form>
        </div>
    );
};

export default NewOrderForm;

