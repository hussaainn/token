import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { Ticket, Clock, MapPin, CheckCircle2, XCircle, ChevronRight, Calendar, User, Award, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const MyTokens = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedToken, setSelectedToken] = useState(null);
    const [loyaltyData, setLoyaltyData] = useState(null);
    const navigate = useNavigate();

    const activeToken = tokens.find(t => ['waiting', 'serving'].includes(t.status));
    const { arrivalStatus, distance, error: geoError } = useGeoLocation(activeToken?._id);

    useEffect(() => {
        fetchTokens();
        fetchLoyalty();
    }, []);

    const fetchLoyalty = async () => {
        try {
            const res = await api.get('/loyalty/me');
            setLoyaltyData(res.data.loyalty);
        } catch (err) {
            console.error('Error fetching loyalty data');
        }
    };

    const fetchTokens = async () => {
        try {
            const res = await api.get('/tokens/my');
            setTokens(res.data.tokens);
            if (res.data.tokens.length > 0) {
                setSelectedToken(res.data.tokens[0]);
            }
        } catch (err) {
            console.error('Error fetching tokens');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (tokenId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.patch(`/tokens/${tokenId}/cancel`);
            toast.success('Token cancelled successfully');
            fetchTokens();
        } catch (err) {
            toast.error('Failed to cancel token');
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="section-header">
                <h2 className="section-title">My Tokens</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={fetchTokens} className="btn btn-secondary btn-sm">Refresh</button>
                </div>
            </div>

            {loyaltyData && (
                <div className="card stat-card" style={{ borderLeftColor: 'var(--primary)', marginBottom: '2rem', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p className="stat-card-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Award size={16} /> {loyaltyData.tier?.toUpperCase() || 'BRONZE'} TIER
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h1 className="stat-card-value" style={{ margin: 0 }}>{loyaltyData.totalPoints} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>pts</span></h1>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>View your full history and redeem rewards.</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/customer/loyalty')}>Rewards Center</button>
                    <Sparkles className="stat-card-icon" style={{ opacity: 0.05, top: '20%' }} />
                </div>
            )}

            {tokens.length === 0 ? (
                <div className="empty-state card">
                    <Ticket className="empty-state-icon" />
                    <h3>No Tokens Found</h3>
                    <p>You haven't booked any services yet.</p>
                    <a href="/customer/book" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Book Now</a>
                </div>
            ) : (
                <div className="grid-2">
                    {/* Token List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tokens.map(token => (
                            <div
                                key={token._id}
                                className={`card token-card ${selectedToken?._id === token._id ? 'active' : ''}`}
                                style={{
                                    cursor: 'pointer',
                                    border: selectedToken?._id === token._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    padding: '1rem'
                                }}
                                onClick={() => setSelectedToken(token)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div>
                                        <span className="token-number">{token.tokenNumber}</span>
                                        <h4 style={{ margin: '0.25rem 0' }}>{token.service.name}</h4>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {format(new Date(token.date), 'MMM dd')}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {token.timeSlot}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={`badge badge-${token.status}`}>{token.status}</div>
                                        {token.status === 'waiting' && token.arrivalStatus === 'arrived' && (
                                            <div className="badge badge-arrived" style={{ display: 'block', marginTop: '0.5rem' }}>Arrived</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Token Details & QR */}
                    <div>
                        {selectedToken && (
                            <div className="card" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Token Details</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Scan this code at the salon entrance</p>
                                </div>

                                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                                    <QRCodeSVG
                                        value={JSON.stringify({ tokenNumber: selectedToken.tokenNumber, qrToken: selectedToken.qrToken })}
                                        size={180}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Service</span>
                                        <span style={{ fontWeight: 600 }}>{selectedToken.service.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Professional</span>
                                        <span style={{ fontWeight: 600 }}>{selectedToken.staff?.name || 'Any Available'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Queue Position</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}># {selectedToken.position || '-'}</span>
                                    </div>
                                </div>

                                {selectedToken.status === 'waiting' && (
                                    <div className="card" style={{ background: 'rgba(108,99,255,0.05)', border: '1px dashed var(--primary)', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <MapPin size={20} style={{ color: 'var(--primary)' }} />
                                            <div>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Arrival Tracker</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {arrivalStatus === 'arrived'
                                                        ? "Status: You've arrived at the salon."
                                                        : geoError
                                                            ? `Location blocked: Enable it for tracking.`
                                                            : distance ? `Distance: ~${distance}m to salon` : "Calculating distance..."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['waiting'].includes(selectedToken.status) && (
                                        <>
                                            <button className="btn btn-danger btn-full" onClick={() => handleCancel(selectedToken._id)}>Cancel Token</button>
                                            <button className="btn btn-secondary btn-full" onClick={() => navigate('/customer/reschedule', { state: { token: selectedToken } })}>Reschedule</button>
                                        </>
                                    )}
                                    {selectedToken.status === 'completed' && (
                                        <button className="btn btn-primary btn-full" onClick={() => navigate('/customer/reviews', { state: { token: selectedToken } })}>Rate Experience</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTokens;
