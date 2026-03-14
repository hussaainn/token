import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { Ticket, Clock, MapPin, CheckCircle2, XCircle, ChevronRight, Calendar, User, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import AddServiceModal from '../../components/AddServiceModal';
import GeoArrivalCard from '../../components/GeoArrivalCard';

const MyTokens = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedToken, setSelectedToken] = useState(null);
    const [selectedTokenForAddOn, setSelectedTokenForAddOn] = useState(null);
    const navigate = useNavigate();

    const activeToken = tokens.find(t => ['waiting', 'serving'].includes(t.status));
    const { arrivalStatus, distance, error: geoError } = useGeoLocation(activeToken);

    useEffect(() => {
        fetchTokens();
    }, []);

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {activeToken && <GeoArrivalCard activeToken={activeToken} />}

                        {tokens.filter(t => ['waiting', 'arrived', 'serving'].includes(t.status)).length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Active & Upcoming</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {tokens.filter(t => ['waiting', 'arrived', 'serving'].includes(t.status)).map(token => (
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
                                                    <h4 style={{ margin: '0.25rem 0' }}>{token.service?.name || 'Unknown Service'}</h4>
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
                            </div>
                        )}

                        {tokens.filter(t => ['completed'].includes(t.status)).length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Completed</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {tokens.filter(t => ['completed'].includes(t.status)).map(token => (
                                        <div
                                            key={token._id}
                                            className={`card token-card ${selectedToken?._id === token._id ? 'active' : ''}`}
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedToken?._id === token._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                padding: '1rem',
                                                backgroundColor: 'var(--bg-secondary)'
                                            }}
                                            onClick={() => setSelectedToken(token)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <div>
                                                    <span className="token-number">{token.tokenNumber}</span>
                                                    <h4 style={{ margin: '0.25rem 0' }}>{token.service?.name || 'Unknown Service'}</h4>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {format(new Date(token.date), 'MMM dd')}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {token.timeSlot}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div className={`badge badge-${token.status}`}>{token.status}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tokens.filter(t => ['cancelled', 'no-show'].includes(t.status)).length > 0 && (
                            <div style={{ opacity: 0.7 }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Cancelled</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {tokens.filter(t => ['cancelled', 'no-show'].includes(t.status)).map(token => (
                                        <div
                                            key={token._id}
                                            className={`card token-card ${selectedToken?._id === token._id ? 'active' : ''}`}
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedToken?._id === token._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                padding: '1rem',
                                                backgroundColor: 'var(--bg-secondary)',
                                                filter: 'grayscale(100%)'
                                            }}
                                            onClick={() => setSelectedToken(token)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <div>
                                                    <span className="token-number">{token.tokenNumber}</span>
                                                    <h4 style={{ margin: '0.25rem 0' }}>{token.service?.name || 'Unknown Service'}</h4>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {format(new Date(token.date), 'MMM dd')}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {token.timeSlot}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div className={`badge badge-${token.status}`}>{token.status}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                        <span style={{ fontWeight: 600 }}>{selectedToken.service?.name || 'Unknown Service'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Professional</span>
                                        <span style={{ fontWeight: 600 }}>{selectedToken.staff?.name || 'Any Available'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Queue Position</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}># {selectedToken.position || '-'}</span>
                                    </div>
                                    {selectedToken.addOnServices && selectedToken.addOnServices.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(244, 63, 143, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Add-on Services</span>
                                            {selectedToken.addOnServices.map((addon, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>• {addon.service?.name}</span>
                                                    <span style={{ fontWeight: 500 }}>₹{addon.price || 0}</span>
                                                </div>
                                            ))}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0 0', marginTop: '0.5rem', fontSize: '0.9rem', borderTop: '1px dashed var(--border)' }}>
                                                <span style={{ fontWeight: 600 }}>Total</span>
                                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{selectedToken.totalAmount || 0}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedToken.addOnServices && selectedToken.addOnServices.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(244, 63, 143, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Add-on Services</span>
                                            {selectedToken.addOnServices.map((addon, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>• {addon.service?.name}</span>
                                                    <span style={{ fontWeight: 500 }}>₹{addon.price || 0}</span>
                                                </div>
                                            ))}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0 0', marginTop: '0.5rem', fontSize: '0.9rem', borderTop: '1px dashed var(--border)' }}>
                                                <span style={{ fontWeight: 600 }}>Total</span>
                                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{selectedToken.totalAmount || 0}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedToken.status === 'waiting' && (
                                    <div className="card" style={{ background: arrivalStatus === 'arrived' ? 'rgba(34,197,94,0.05)' : 'rgba(108,99,255,0.05)', border: arrivalStatus === 'arrived' ? '1px dashed var(--success)' : '1px dashed var(--primary)', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            {arrivalStatus === 'arrived' ? <CheckCircle2 size={20} style={{ color: 'var(--success)' }} /> : <MapPin size={20} style={{ color: 'var(--primary)' }} />}
                                            <div>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: arrivalStatus === 'arrived' ? 'var(--success)' : 'inherit' }}>
                                                    {arrivalStatus === 'arrived' ? 'Arrived at Salon' : 'Arrival Tracker'}
                                                </p>
                                                <p style={{ fontSize: '0.8rem', color: arrivalStatus === 'arrived' ? 'var(--success)' : 'var(--text-secondary)' }}>
                                                    {arrivalStatus === 'arrived'
                                                        ? "Status: You've successfully checked in."
                                                        : geoError
                                                            ? `Location blocked: Enable it for tracking.`
                                                            : distance ? `Distance: ~${distance}m to salon` : "Calculating distance..."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {['waiting'].includes(selectedToken.status) && (
                                        <>
                                            <button className="btn btn-danger btn-full" style={{ flex: '1 1 45%' }} onClick={() => handleCancel(selectedToken._id)}>Cancel</button>
                                            <button className="btn btn-secondary btn-full" style={{ flex: '1 1 45%' }} onClick={() => navigate('/customer/reschedule', { state: { token: selectedToken } })}>Reschedule</button>
                                        </>
                                    )}
                                    {['waiting', 'arrived'].includes(selectedToken.status) && (
                                        <button
                                            className="btn btn-outline-primary btn-full"
                                            style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            onClick={() => setSelectedTokenForAddOn(selectedToken)}
                                        >
                                            <Plus size={16} /> Add a Service
                                        </button>
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

            {selectedTokenForAddOn && (
                <AddServiceModal
                    isOpen={!!selectedTokenForAddOn}
                    onClose={() => setSelectedTokenForAddOn(null)}
                    token={selectedTokenForAddOn}
                    onSuccess={() => {
                        fetchTokens();
                    }}
                />
            )}
        </div>
    );
};

export default MyTokens;
