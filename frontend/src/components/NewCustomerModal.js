import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const NewCustomerModal = ({ show, onHide, onSuccess, customer = null }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});

    const isEdit = !!customer;

    // Reset or Populate form when modal opens
    React.useEffect(() => {
        if (!show) {
            setFormData({ name: '', phone: '', notes: '' });
            setErrors({});
            setTouched({});
        } else if (customer) {
            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                notes: customer.notes || ''
            });
        }
    }, [show, customer]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name') {
            const trimmed = value.trim();
            if (!trimmed) error = 'Name is required';
            else if (trimmed.length < 2) error = 'Minimum 2 characters required';
            else if (/^\d+$/.test(trimmed)) error = 'Name cannot be purely numeric';
        } else if (name === 'phone') {
            if (!value) error = 'Phone is required';
            else if (!/^\d{10}$/.test(value)) error = 'Must be exactly 10 digits';
        } else if (name === 'notes') {
            if (value && value.length > 255) error = 'Max 255 characters allowed';
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Strict input control for phone (numbers only)
        if (name === 'phone' && value && !/^\d*$/.test(value)) return;
        if (name === 'phone' && value.length > 10) return;

        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time validation if touched
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const isFormValid = () => {
        const nameError = validateField('name', formData.name);
        const phoneError = validateField('phone', formData.phone);
        const notesError = validateField('notes', formData.notes);
        return !nameError && !phoneError && !notesError && formData.name && formData.phone;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Final validation before submit
        const nameError = validateField('name', formData.name);
        const phoneError = validateField('phone', formData.phone);
        const notesError = validateField('notes', formData.notes);

        if (nameError || phoneError || notesError) {
            setErrors({ name: nameError, phone: phoneError, notes: notesError });
            setTouched({ name: true, phone: true, notes: true });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                name: formData.name.trim()
            };

            let res;
            if (isEdit) {
                res = await api.put(`/customers/${customer.id}`, payload);
                addToast('Customer Updated Successfully', 'success');
            } else {
                res = await api.post('/customers', payload);
                addToast('Customer Created Successfully', 'success');
            }

            if (onSuccess) onSuccess(res.data.data || res.data);

            // Explicitly Close ONLY after success
            onHide();
        } catch (error) {
            console.error('Submit Error:', error);
            const serverError = error.response?.data?.error || '';
            const normalizedError = serverError.toLowerCase();
            const isDuplicatePhone =
                /phone.*already exists/.test(normalizedError) ||
                /already registered/.test(normalizedError) ||
                /duplicate/.test(normalizedError);

            if (isDuplicatePhone) {
                setErrors(prev => ({ ...prev, phone: 'This phone number is already registered' }));
                setTouched(prev => ({ ...prev, phone: true }));
                addToast('Customer with this phone already exists', 'warning');
            } else {
                addToast(serverError || `Failed to ${isEdit ? 'update' : 'create'} customer`, 'error');
            }
            // Note: Does not call onHide(), leaving the modal open for user correction
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? 'Edit Customer' : 'Add New Customer'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="customer-form" onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter customer name (min 2 characters)"
                            isInvalid={!!errors.name && touched.name}
                            autoFocus
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter 10-digit mobile number"
                            isInvalid={!!errors.phone && touched.phone}
                        />
                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Optional notes about customer"
                            isInvalid={!!errors.notes && touched.notes}
                        />
                        <Form.Control.Feedback type="invalid">{errors.notes}</Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            {formData.notes.length}/255 characters
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button
                    variant="primary"
                    type="submit"
                    form="customer-form"
                    disabled={loading || !isFormValid()}
                >
                    {loading ? 'Saving...' : (isEdit ? 'Update Customer' : 'Save Customer')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NewCustomerModal;
