import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

const BookService = () => {
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        serviceId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        timeSlot: '',
        staffId: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [waitTime, setWaitTime] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, staffRes] = await Promise.all([
                    api.get('/services'),
                    api.get('/staff')
                ]);
                setServices(servicesRes.data.services);
                setStaff(staffRes.data.staff.filter(s => s.isActive));
            } catch (err) {
                toast.error('Failed to load services');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const timeSlots = [
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
        '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
    ];

    const handleServiceSelect = async (serviceId) => {
        setFormData({ ...formData, serviceId });
        setStep(2);

        // Fetch AI predicted wait time
        try {
            const res = await api.get(`/tokens/waiting-time?serviceId=${serviceId}`);
            setWaitTime(res.data.estimatedMinutes);
        } catch (err) {
            console.error('Wait time prediction error');
        }
    };

    const handleBooking = async () => {
        if (!formData.timeSlot) return toast.error('Please select a time slot');
        setIsSubmitting(true);
        try {
            const res = await api.post('/tokens', formData);
            toast.success('Token generated successfully!');
            navigate(`/customer/tokens`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const selectedService = services.find(s => s._id === formData.serviceId);

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-header">
                <h2 className="section-title">Book a Service</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '32px', height: '8px', borderRadius: '4px',
                            background: step >= s ? 'var(--primary)' : 'var(--border)'
                        }}></div>
                    ))}
                </div>
            </div>

            {step === 1 && (
                <div className="fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>Select a Service</h3>
                    <div className="grid-2">
                        {services.map(service => (
                            <div key={service._id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} onClick={() => handleServiceSelect(service._id)}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ color: 'var(--primary)' }}>{service.name}</h4>
                                        <span style={{ fontWeight: 700 }}>₹{service.price}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{service.description}</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                        {service.duration} mins
                                    </span>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setStep(1)}>
                        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        <span style={{ fontWeight: 600 }}>Back to Services</span>
                    </div>

                    <div className="card" style={{ marginBottom: '2rem', background: 'var(--bg-secondary)', border: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>{selectedService?.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedService?.duration} mins • ₹{selectedService?.price}</p>
                            </div>
                            {waitTime && (
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Wait Time</p>
                                    <p style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.25rem' }}>~{waitTime}m</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label"><Calendar size={16} /> Select Date</label>
                            <input
                                type="date"
                                className="form-control"
                                min={format(new Date(), 'yyyy-MM-dd')}
                                max={format(addDays(new Date(), 7), 'yyyy-MM-dd')}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label"><User size={16} /> Preferred Staff (Optional)</label>
                            <select
                                className="form-control"
                                value={formData.staffId}
                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                            >
                                <option value="">Any Staff</option>
                                {staff.map(member => (
                                    <option key={member._id} value={member._id}>{member.name} - {member.specialization}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h4 style={{ margin: '1.5rem 0 1rem' }}>Available Slots</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                        {timeSlots.map(slot => (
                            <button
                                key={slot}
                                className={`btn ${formData.timeSlot === slot ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                onClick={() => setFormData({ ...formData, timeSlot: slot })}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Special Notes (Optional)</label>
                        <textarea
                            className="form-control"
                            placeholder="e.g. skin allergies, specific requests..."
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary btn-lg" onClick={() => setStep(3)} disabled={!formData.timeSlot}>
                            Confirm Details <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setStep(2)}>
                        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        <span style={{ fontWeight: 600 }}>Back to Options</span>
                    </div>

                    <div className="card">
                        <h3>Review Your Booking</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Please verify your appointment details below.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service</p>
                                    <p style={{ fontWeight: 700 }}>{selectedService?.name}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date & Time</p>
                                    <p style={{ fontWeight: 700 }}>{format(new Date(formData.date), 'MMM dd, yyyy')} at {formData.timeSlot}</p>
                                </div>
                                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Staff</p>
                                    <p style={{ fontWeight: 700 }}>{formData.staffId ? staff.find(s => s._id === formData.staffId)?.name : 'Any Available Staff'}</p>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>Total Price</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{selectedService?.price}</span>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(34,197,94,0.1)', border: 'none', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <AlertCircle size={20} style={{ color: 'var(--success)', marginTop: '2px' }} />
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>Smart Prediction</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Based on current salon traffic, you'll be seen in approximately {waitTime || 30} minutes after your slot starts.</p>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-full btn-lg"
                            style={{ marginTop: '2rem' }}
                            onClick={handleBooking}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="spinner" size={20} /> : 'Confirm & Generate Token'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookService;
