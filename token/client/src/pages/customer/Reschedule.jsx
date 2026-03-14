import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

const Reschedule = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token;

    if (!token) {
        navigate('/customer/tokens');
        return null;
    }

    const [date, setDate] = useState(format(new Date(token.date), 'yyyy-MM-dd'));
    const [timeSlot, setTimeSlot] = useState(token.timeSlot);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timeSlots = [
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
        '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
    ];

    const handleReschedule = async () => {
        setIsSubmitting(true);
        try {
            await api.patch(`/tokens/${token._id}/reschedule`, {
                date,
                timeSlot
            });
            toast.success('Token rescheduled successfully');
            navigate('/customer/tokens');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Rescheduling failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div className="section-header">
                <h2 className="section-title">Reschedule Token</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Modify your appointment for {token.tokenNumber}</p>
            </div>

            <div className="card">
                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '0.25rem' }}>{token.service?.name || 'Unknown Service'}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Current: {format(new Date(token.date), 'MMM dd, yyyy')} at {token.timeSlot}
                    </p>
                </div>

                <div className="form-group">
                    <label className="form-label"><Calendar size={16} /> New Date</label>
                    <input
                        type="date"
                        className="form-control"
                        min={format(new Date(), 'yyyy-MM-dd')}
                        max={format(addDays(new Date(), 7), 'yyyy-MM-dd')}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <h4 style={{ margin: '1.5rem 0 1rem' }}>Available Slots</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                    {timeSlots.map(slot => (
                        <button
                            key={slot}
                            className={`btn ${timeSlot === slot ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                            onClick={() => setTimeSlot(slot)}
                        >
                            {slot}
                        </button>
                    ))}
                </div>

                <div className="card" style={{ marginTop: '2rem', background: 'rgba(245,158,11,0.05)', border: '1px dashed var(--warning)', display: 'flex', gap: '0.75rem' }}>
                    <AlertCircle size={20} style={{ color: 'var(--warning)', marginTop: '2px' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Rescheduling will move your position in the queue. You will receive a new estimated wait time once confirmed.
                    </p>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary btn-full" onClick={() => navigate('/customer/tokens')}>Keep Existing</button>
                    <button
                        className="btn btn-primary btn-full"
                        onClick={handleReschedule}
                        disabled={isSubmitting || (date === format(new Date(token.date), 'yyyy-MM-dd') && timeSlot === token.timeSlot)}
                    >
                        {isSubmitting ? <Loader2 className="spinner" size={20} /> : 'Confirm New Time'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reschedule;
