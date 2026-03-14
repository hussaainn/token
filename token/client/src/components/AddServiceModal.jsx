import React, { useState, useEffect } from 'react';
import { X, Ticket } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AddServiceModal = ({ isOpen, onClose, token, onSuccess }) => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedService('');
            const fetchServices = async () => {
                setLoading(true);
                try {
                    const res = await api.get('/services');
                    setServices(res.data.services || []);
                } catch (err) {
                    toast.error('Failed to load services');
                } finally {
                    setLoading(false);
                }
            };
            fetchServices();
        }
    }, [isOpen]);

    if (!isOpen || !token) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedService) return;

        setSubmitting(true);
        try {
            await api.post(`/tokens/${token._id}/addons`, { serviceId: selectedService });
            toast.success('Add-on service added successfully');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add service');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal-content fade-in" style={{
                background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px',
                position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text)' }}>Add Service</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Add extra services to Token {token.tokenNumber}
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>Loading services...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Service</label>
                            <div className="input-with-icon">
                                <Ticket size={18} className="icon" />
                                <select
                                    className="form-control"
                                    value={selectedService}
                                    onChange={e => setSelectedService(e.target.value)}
                                    required
                                    style={{ paddingLeft: '2.5rem' }}
                                >
                                    <option value="" disabled>Choose a service</option>
                                    {services.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} (₹{s.price})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }} disabled={submitting}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting || !selectedService} style={{ flex: 1 }}>
                                {submitting ? 'Adding...' : 'Add Service'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddServiceModal;
