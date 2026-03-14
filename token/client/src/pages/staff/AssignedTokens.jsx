import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import {
    CheckCircle, Play, XCircle, Clock,
    MapPin, User, Ticket, Filter, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import WalkInModal from '../../components/WalkInModal';
import PaymentModal from '../../components/PaymentModal';
import AddServiceModal from '../../components/AddServiceModal';
import { Plus } from 'lucide-react';

const AssignedTokens = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('available'); // available, my-active, history
    const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
    const [selectedTokenForPayment, setSelectedTokenForPayment] = useState(null);
    const [selectedTokenForAddOn, setSelectedTokenForAddOn] = useState(null);
    const { socket } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        fetchMyTokens();
    }, [view]);

    useEffect(() => {
        if (socket) {
            socket.on('token:statusChange', () => fetchMyTokens());
            return () => socket.off('token:statusChange');
        }
    }, [socket]);

    const fetchMyTokens = async () => {
        try {
            let url = '';
            if (view === 'available') url = '/tokens/my-assigned?type=available';
            else if (view === 'my-active') url = '/tokens/my-assigned?type=assigned&status=active';
            else url = '/tokens/my-assigned?type=assigned&status=completed';

            const res = await api.get(url);
            setTokens(res.data.tokens);
        } catch (err) {
            toast.error('Failed to load your tokens');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (tokenId, status) => {
        try {
            await api.patch(`/tokens/${tokenId}/status`, { status });
            toast.success(`Token marked as ${status}`);
            fetchMyTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handlePaymentComplete = async (tokenId, data) => {
        try {
            await api.patch(`/tokens/${tokenId}/status`, data);
            toast.success('Token marked as completed with payment');
            fetchMyTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment update failed');
        }
    };

    const handleAcceptToken = async (tokenId) => {
        try {
            await api.patch(`/tokens/${tokenId}/accept`);
            toast.success('Customer accepted successfully!');
            setView('my-active');
            // Fetch is handled by socket, or we could call fetchMyTokens() here but setView triggers it
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept token');
        }
    };

    const handleCallNext = async () => {
        try {
            const res = await api.post('/tokens/call-next');
            toast.success(`Called token ${res.data.token.tokenNumber}`);
            fetchMyTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to call next customer');
        }
    };

    const handleOpenPayment = async (token) => {
        try {
            const res = await api.get(`/tokens/${token._id}`);
            setSelectedTokenForPayment(res.data.token);
        } catch (err) {
            console.error('Failed to fetch token details:', err);
            // Fallback to original token
            setSelectedTokenForPayment(token);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b85ff 100%)', color: '#fff', border: 'none' }}>
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Welcome back, {user?.name}! 👋</h2>
                    <p style={{ opacity: 0.9, margin: 0 }}>Manage your scheduled and active clients. Check the pool to accept new walk-ins.</p>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => setIsWalkInModalOpen(true)}
                    className="card action-card" style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        background: 'linear-gradient(135deg, var(--success) 0%, #22c55e 100%)',
                        color: '#fff', padding: '1.5rem', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%'
                    }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Generate Walk-in</h4>
                        <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.85rem' }}>Add a new client</p>
                    </div>
                </button>

                <button
                    onClick={handleCallNext}
                    className="card action-card" style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        background: 'linear-gradient(135deg, var(--warning) 0%, #facc15 100%)',
                        color: '#fff', padding: '1.5rem', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%'
                    }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <Play size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Call Next Customer</h4>
                        <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.85rem' }}>Automated next-in-line</p>
                    </div>
                </button>
            </div>

            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Assigned Tokens</h3>
                <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                    <button
                        className={`btn btn-sm ${view === 'available' ? 'btn-primary' : ''}`}
                        style={{ border: 'none', background: view === 'available' ? 'var(--primary)' : 'transparent', color: view === 'available' ? '#fff' : 'var(--text)' }}
                        onClick={() => setView('available')}
                    >
                        Available Pool
                    </button>
                    <button
                        className={`btn btn-sm ${view === 'my-active' ? 'btn-primary' : ''}`}
                        style={{ border: 'none', background: view === 'my-active' ? 'var(--primary)' : 'transparent', color: view === 'my-active' ? '#fff' : 'var(--text)' }}
                        onClick={() => setView('my-active')}
                    >
                        My Active
                    </button>
                    <button
                        className={`btn btn-sm ${view === 'history' ? 'btn-primary' : ''}`}
                        style={{ border: 'none', background: view === 'history' ? 'var(--primary)' : 'transparent', color: view === 'history' ? '#fff' : 'var(--text)' }}
                        onClick={() => setView('history')}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="grid-1">
                {tokens.length > 0 ? (
                    tokens.map(token => (
                        <div key={token._id} className="card token-card" style={{ borderLeft: `6px solid ${token.status === 'serving' ? 'var(--success)' : 'var(--primary)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Token</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{token.tokenNumber}</div>
                                    </div>

                                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h3 style={{ margin: 0 }}>{token.customer?.name || token.customerName || 'Walk-in Customer'}</h3>
                                            {token.arrivalStatus === 'arrived' && (
                                                <span className="badge badge-arrived" style={{ fontSize: '0.7rem' }}>ARRIVED</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', gap: '1rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Ticket size={14} /> {token.service?.name || 'Unknown Service'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {token.timeSlot}</span>
                                        </div>
                                        {token.addOnServices && token.addOnServices.length > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                                                + {token.addOnServices.length} Add-on(s) (₹{token.addOnServices.reduce((sum, item) => sum + (item.price || 0), 0)})
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={`badge badge-${token.status}`}>{token.status.toUpperCase()}</div>
                                        {token.notes && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '0.5rem', fontStyle: 'italic' }}>Has special notes</div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {view === 'available' ? (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleAcceptToken(token._id)}
                                                style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                                            >
                                                <UserPlus size={18} style={{ marginRight: '6px' }} /> Accept Customer
                                            </button>
                                        ) : (
                                            <>
                                                {token.status === 'waiting' && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleStatusUpdate(token._id, 'serving')}
                                                    >
                                                        <Play size={18} style={{ marginRight: '6px' }} /> Start Service
                                                    </button>
                                                )}
                                                {token.status === 'serving' && (
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() => handleOpenPayment(token)}
                                                    >
                                                        <CheckCircle size={18} style={{ marginRight: '6px' }} /> Complete
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => setSelectedTokenForAddOn(token)}
                                                    title="Add Service"
                                                    style={{ padding: '0.5rem 0.75rem' }}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                {token.status === 'arrived' && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleStatusUpdate(token._id, 'serving')}
                                                    >
                                                        <Play size={18} style={{ marginRight: '6px' }} /> Start Service
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {token.notes && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Customer Notes:</strong>
                                    {token.notes}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-state card">
                        <User className="empty-state-icon" />
                        <h3>No Tokens Found</h3>
                        <p>There are no tokens matching this view.</p>
                    </div>
                )}
            </div>

            <WalkInModal
                isOpen={isWalkInModalOpen}
                onClose={() => setIsWalkInModalOpen(false)}
                onSuccess={fetchMyTokens}
            />

            {selectedTokenForPayment && (
                <PaymentModal
                    isOpen={!!selectedTokenForPayment}
                    onClose={() => setSelectedTokenForPayment(null)}
                    token={selectedTokenForPayment}
                    onComplete={handlePaymentComplete}
                />
            )}

            {selectedTokenForAddOn && (
                <AddServiceModal
                    isOpen={!!selectedTokenForAddOn}
                    onClose={() => setSelectedTokenForAddOn(null)}
                    token={selectedTokenForAddOn}
                    onSuccess={fetchMyTokens}
                />
            )}
        </div>
    );
};

export default AssignedTokens;
