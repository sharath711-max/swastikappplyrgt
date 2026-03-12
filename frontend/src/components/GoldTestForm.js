import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import api from '../services/api';

const GoldTestForm = ({ onSubmit, onCancel }) => {
    const [customerId, setCustomerId] = useState('');
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([
        { item: '', total_weight: '', test_weight: '', purity: '', weight_loss: '', certificate_required: false }
    ]);

    useEffect(() => {
        api.get('/customers').then(res => setCustomers(res.data)).catch(console.error);
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { item: '', total_weight: '', test_weight: '', purity: '', weight_loss: '', certificate_required: false }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            customer_id: customerId,
            items: items.map(item => ({
                ...item,
                total_weight: parseFloat(item.total_weight),
                test_weight: parseFloat(item.test_weight),
                purity: parseFloat(item.purity),
                weight_loss: parseFloat(item.weight_loss) || 0
            }))
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Select Customer</label>
                <select
                    className="form-control"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
            </div>

            <h5 style={{ marginBottom: '16px', fontWeight: 600 }}>Test Items</h5>
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table className="slds-table slds-table_bordered" style={{ minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Total Wt (g)</th>
                            <th>Test Wt (g)</th>
                            <th>Loss (g)</th>
                            <th>Purity (%)</th>
                            <th className="text-center">Cert?</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.item}
                                        onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                        placeholder="e.g., Necklace"
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.001"
                                        className="form-control"
                                        value={item.total_weight}
                                        onChange={(e) => handleItemChange(index, 'total_weight', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.001"
                                        className="form-control"
                                        value={item.test_weight}
                                        onChange={(e) => handleItemChange(index, 'test_weight', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.001"
                                        className="form-control"
                                        value={item.weight_loss}
                                        onChange={(e) => handleItemChange(index, 'weight_loss', e.target.value)}
                                        placeholder="0.000"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        value={item.purity}
                                        onChange={(e) => handleItemChange(index, 'purity', e.target.value)}
                                        required
                                    />
                                </td>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={item.certificate_required}
                                        onChange={(e) => handleItemChange(index, 'certificate_required', e.target.checked)}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                </td>
                                <td className="text-center">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ color: '#ea001e', borderColor: '#ea001e' }}
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button type="button" className="btn btn-secondary" style={{ marginBottom: '24px' }} onClick={addItem}>
                <FaPlus style={{ marginRight: '8px' }} /> Add Another Item
            </button>

            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Test Record</button>
            </div>
        </form>
    );
};

export default GoldTestForm;
