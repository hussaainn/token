import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

const Feedback = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/reviews/admin/all');
                setReviews(res.data.reviews || res.data.data || []);
            } catch (err) {
                console.error('Failed to load feedback', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const avg = reviews.length
        ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : 0;

    const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <h2 style={{ marginBottom: '0.5rem' }}>Customer Feedback</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>All reviews submitted by customers</p>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>{avg}</div>
                    <div style={{ color: '#f59e0b', fontSize: '1.5rem' }}>{renderStars(Math.round(avg))}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Average Rating</div>
                </div>
                <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--success)' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--success)' }}>{reviews.length}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Total Reviews</div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="card empty-state">
                    <Star className="empty-state-icon" />
                    <h3>No Feedback Yet</h3>
                    <p>Customer reviews will appear here once submitted.</p>
                </div>
            ) : (
                reviews.map(r => (
                    <div key={r._id} className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{r.customer?.name || 'Anonymous'}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {r.service?.name || '—'} • {r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy') : ''}
                                </div>
                            </div>
                            <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>{renderStars(r.rating || 0)}</div>
                        </div>
                        {r.comment && (
                            <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                "{r.comment}"
                            </p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default Feedback;
