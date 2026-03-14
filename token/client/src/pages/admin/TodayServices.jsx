import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';

const TodayServices = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchToday = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await api.get(`/tokens?date=${today}&limit=100`);
                setTokens(res.data.tokens || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchToday();
    }, []);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const stats = {
        total: tokens.length,
        completed: tokens.filter(t => t.status === 'completed').length,
        serving: tokens.filter(t => t.status === 'serving').length,
        waiting: tokens.filter(t => t.status === 'waiting').length,
        revenue: tokens
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.service?.price || 0), 0)
    };

    return (
        <div className="fade-in">
            <h2 style={{ marginBottom: '0.5rem' }}>Today's Services</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>

            <div className="grid-4" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Total Bookings', value: stats.total, color: 'var(--primary)' },
                    { label: 'Completed', value: stats.completed, color: 'var(--success)' },
                    { label: 'Currently Serving', value: stats.serving, color: 'var(--warning)' },
                    { label: 'Waiting', value: stats.waiting, color: 'var(--accent)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>All Tokens Today</h3>
                {tokens.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No services booked today yet.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                {['Token', 'Customer', 'Service', 'Staff', 'Time Slot', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tokens.map(t => (
                                <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{t.tokenNumber}</td>
                                    <td style={{ padding: '0.75rem' }}>{t.customer?.name || t.customerName || 'Walk-in'}</td>
                                    <td style={{ padding: '0.75rem' }}>{t.service?.name || '—'}</td>
                                    <td style={{ padding: '0.75rem' }}>{t.staff?.name || 'Unassigned'}</td>
                                    <td style={{ padding: '0.75rem' }}>{t.timeSlot}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span className={`badge badge-${t.status}`}>{t.status.toUpperCase()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TodayServices;
