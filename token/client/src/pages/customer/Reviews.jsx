import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Star, MessageSquare, Send, CheckCircle2, User, Ticket } from 'lucide-react';
import { format } from 'date-fns';

const Reviews = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // For the active review form
    const [activeToken, setActiveToken] = useState(location.state?.token || null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    useEffect(() => {
        fetchCompletedTokens();
    }, []);

    const fetchCompletedTokens = async () => {
        try {
            const res = await api.get('/tokens/my?status=completed');
            // Filter out tokens that already have reviews if possible, 
            // but for now let's just show all completed.
            setTokens(res.data.tokens);
        } catch (err) {
            console.error('Error fetching completed tokens');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeToken) return;

        setSubmitLoading(true);
        try {
            await api.post('/reviews', {
                tokenId: activeToken._id,
                rating,
                comment
            });
            toast.success('Thank you for your feedback!');
            setActiveToken(null);
            setComment('');
            setRating(5);
            fetchCompletedTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-header">
                <h2 className="section-title">Rate Your Experience</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Your feedback helps us improve our services</p>
            </div>

            <div className="grid-1" style={{ gap: '2rem' }}>
                {/* Active Review Form */}
                {activeToken ? (
                    <div className="card" style={{ border: '2px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>Review for {activeToken.service.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Provided by {activeToken.staff?.name || 'Mercy Salon Professional'} on {format(new Date(activeToken.date), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setActiveToken(null)}
                            >
                                Change Token
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>How was your experience?</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                size={36}
                                                fill={(hoveredStar || rating) >= star ? 'var(--warning)' : 'none'}
                                                color={(hoveredStar || rating) >= star ? 'var(--warning)' : 'var(--text-muted)'}
                                                style={{ transition: 'all 0.1s ease' }}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--warning)' }}>
                                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label"><MessageSquare size={16} /> Share your thoughts</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="What did you like? What can we improve?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full btn-lg"
                                disabled={submitLoading}
                                style={{ marginTop: '1rem' }}
                            >
                                {submitLoading ? 'Submitting...' : 'Submit Review'} <Send size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Recent Completed Services</h3>
                        {tokens.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {tokens.map(token => (
                                    <div key={token._id} className="card" style={{ background: 'var(--bg-secondary)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <Ticket size={20} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700 }}>{token.service?.name || 'Unknown Service'}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed on {format(new Date(token.date), 'MMM dd')}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setActiveToken(token)}
                                        >
                                            Rate Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <CheckCircle2 size={48} style={{ color: 'var(--success)', opacity: 0.3, marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>All caught up! No pending reviews for recently completed services.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
