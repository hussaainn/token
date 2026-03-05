import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { X, User, Phone, CheckCircle, Ticket, Calendar, Clock, Contact } from 'lucide-react';
import { format } from 'date-fns';

const WalkInModal = ({ isOpen, onClose, onSuccess }) => {
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        serviceId: '',
        staffId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        timeSlot: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                customerName: '',
                phone: '',
                serviceId: '',
                staffId: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                timeSlot: ''
            });

            const fetchData = async () => {
                setLoadingData(true);
                try {
                    const [resServ, resStaff] = await Promise.all([
                        api.get('/services'),
                        api.get('/users/staff')
                    ]);
                    setServices(resServ.data.services);
                    setStaff(resStaff.data.staff);

                    if (resServ.data.services.length > 0) {
                        setFormData(prev => ({ ...prev, serviceId: resServ.data.services[0]._id }));
                    }
                } catch (err) {
                    toast.error('Failed to load services or staff lists');
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !formData.date || !formData.serviceId) return;

        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                const res = await api.get(`/tokens/available-slots?date=${formData.date}&staffId=${formData.staffId || ''}`);
                setAvailableSlots(res.data.availableSlots || []);
                if (formData.timeSlot && !res.data.availableSlots.includes(formData.timeSlot)) {
                    setFormData(prev => ({ ...prev, timeSlot: '' })); // clear invalid selection
                }
            } catch (err) {
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        const debounce = setTimeout(fetchSlots, 300);
        return () => clearTimeout(debounce);
    }, [isOpen, formData.date, formData.staffId, formData.serviceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customerName.trim() || !formData.serviceId || !formData.timeSlot) {
            return toast.error('Please fill all required fields');
        }

        setSubmitting(true);
        try {
            const res = await api.post('/tokens/walkin', formData);
            toast.success(`Walk-in added! Token: ${res.data.token.tokenNumber}`, { duration: 5000 });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add walk-in');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', margin: '20px', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={20} style={{ color: 'var(--primary)' }} />
                        Add Walk-in Customer
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    {loadingData ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading required data...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Customer Name *</label>
                                <div className="input-with-icon">
                                    <User size={18} className="icon" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter customer name"
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone Number (Optional)</label>
                                <div className="input-with-icon">
                                    <Phone size={18} className="icon" />
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select Service *</label>
                                <div className="input-with-icon">
                                    <Ticket size={18} className="icon" />
                                    <select
                                        className="form-control"
                                        value={formData.serviceId}
                                        onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Choose a service</option>
                                        {services.map(s => <option key={s._id} value={s._id}>{s.name} (₹{s.price})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select Staff</label>
                                <div className="input-with-icon">
                                    <Contact size={18} className="icon" />
                                    <select
                                        className="form-control"
                                        value={formData.staffId}
                                        onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                                    >
                                        <option value="">No Preference</option>
                                        {staff.map(s => <option key={s._id} value={s._id}>{s.name} — {s.specialization}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Date *</label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} className="icon" />
                                        <input
                                            type="date"
                                            className="form-control"
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Time Slot *</label>
                                    <div className="input-with-icon">
                                        <Clock size={18} className="icon" />
                                        <select
                                            className="form-control"
                                            value={formData.timeSlot}
                                            onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                                            required
                                            disabled={loadingSlots || availableSlots.length === 0}
                                        >
                                            <option value="" disabled>
                                                {loadingSlots ? 'Loading...' : availableSlots.length === 0 ? 'No slots available' : 'Select a time slot'}
                                            </option>
                                            {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-outline-primary" onClick={onClose} disabled={submitting}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting || !formData.timeSlot}>
                                    {submitting ? 'Generating Token...' : 'Add Walk-in & Join Queue'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalkInModal;
