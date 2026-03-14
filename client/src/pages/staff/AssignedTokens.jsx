import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import {
    CheckCircle, Play, XCircle, Clock,
    MapPin, User, Ticket, Filter, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import WalkInModal from '../../components/WalkInModal';

const AssignedTokens = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('active'); // active, history
    const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
    const { socket } = useSocket();

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
            // Endpoint for staff assigned tokens
            const res = await api.get(`/tokens/my-assigned?status=${view === 'active' ? 'active' : 'completed'}`);
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

    const handleClaim = async (tokenId) => {
        try {
            await api.post(`/tokens/${tokenId}/claim`);
            toast.success('Token claimed successfully');
            fetchMyTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to claim token');
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

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">My Assigned Tokens</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your scheduled and active clients</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                    <button
                        className={`btn btn-sm ${view === 'active' ? 'btn-primary' : ''}`}
                        style={{ border: 'none', background: view === 'active' ? 'var(--primary)' : 'transparent', color: view === 'active' ? '#fff' : 'var(--text)' }}
                        onClick={() => setView('active')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`btn btn-sm ${view === 'history' ? 'btn-primary' : ''}`}
                        style={{ border: 'none', background: view === 'history' ? 'var(--primary)' : 'transparent', color: view === 'history' ? '#fff' : 'var(--text)' }}
                        onClick={() => setView('history')}
                    >
                        History
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setIsWalkInModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)' }}>
                        <UserPlus size={16} /> Add Walk-in
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleCallNext}>
                        <Play size={16} style={{ marginRight: '6px' }} /> Call Next Customer
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
                                            <h3 style={{ margin: 0 }}>{token.customer.name}</h3>
                                            {token.arrivalStatus === 'arrived' && (
                                                <span className="badge badge-arrived" style={{ fontSize: '0.7rem' }}>ARRIVED</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', gap: '1rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Ticket size={14} /> {token.service.name}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {token.timeSlot}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={`badge badge-${token.status}`}>{token.status.toUpperCase()}</div>
                                        {!token.staff && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', marginTop: '0.25rem' }}>Unassigned</div>}
                                        {token.notes && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '0.5rem', fontStyle: 'italic' }}>Has special notes</div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {!token.staff && ['waiting', 'arrived'].includes(token.status) ? (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleClaim(token._id)}
                                            >
                                                <UserPlus size={18} style={{ marginRight: '6px' }} /> Claim Token
                                            </button>
                                        ) : (
                                            <>
                                                {(token.status === 'waiting' || token.status === 'arrived') && (
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
                                                        onClick={() => handleStatusUpdate(token._id, 'completed')}
                                                    >
                                                        <CheckCircle size={18} style={{ marginRight: '6px' }} /> Complete
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
                        <p>You don't have any {view === 'active' ? 'active' : 'completed'} tokens assigned.</p>
                    </div>
                )}
            </div>

            <WalkInModal
                isOpen={isWalkInModalOpen}
                onClose={() => setIsWalkInModalOpen(false)}
                onSuccess={fetchMyTokens}
            />
        </div>
    );
};

export default AssignedTokens;
