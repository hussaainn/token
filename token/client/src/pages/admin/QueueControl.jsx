import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import {
    Users, Play, CheckCircle, XCircle, Search,
    Filter, MoreVertical, Bell, MapPin, Scan, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import WalkInModal from '../../components/WalkInModal';
import NotificationModal from '../../components/NotificationModal';
import PaymentModal from '../../components/PaymentModal';
import AddServiceModal from '../../components/AddServiceModal';
import { MessageSquare, Plus } from 'lucide-react';

const QueueControl = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
    const [selectedCustomerForNotification, setSelectedCustomerForNotification] = useState(null);
    const [selectedTokenForPayment, setSelectedTokenForPayment] = useState(null);
    const [selectedTokenForAddOn, setSelectedTokenForAddOn] = useState(null);
    const { socket } = useSocket();

    useEffect(() => {
        fetchActiveTokens();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('queue:update', (updatedQueue) => {
                // Only update if we are not in the middle of a fetch
                setTokens(prev => {
                    // Merge logic or complete replace? The admin endpoint returns more detail
                    // For now, let's just refetch to be safe when queue updates, 
                    // or we could build a more sophisticated update.
                    return prev;
                });
                fetchActiveTokens();
            });

            return () => socket.off('queue:update');
        }
    }, [socket]);

    const fetchActiveTokens = async () => {
        try {
            const res = await api.get('/tokens/queue?limit=50'); // Admin might want more
            setTokens(res.data.queue);
        } catch (err) {
            toast.error('Failed to load queue');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (tokenId, status) => {
        try {
            await api.patch(`/tokens/${tokenId}/status`, { status });
            toast.success(`Token marked as ${status}`);
            fetchActiveTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handlePaymentComplete = async (tokenId, data) => {
        try {
            await api.patch(`/tokens/${tokenId}/status`, data);
            toast.success('Token marked as completed and payment recorded');
            fetchActiveTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment update failed');
        }
    };

    const handleCallNext = async () => {
        try {
            const res = await api.post('/tokens/call-next');
            toast.success(`Called token ${res.data.token.tokenNumber}`);
            fetchActiveTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to call next customer');
        }
    };

    const handleSendNotification = async (message) => {
        if (!selectedCustomerForNotification) return;

        try {
            const isCancellation = message.toLowerCase().includes('cancelled');
            const tokenId = selectedCustomerForNotification._id;

            // Safely extract customer ID whether it is populated or a string
            const recipientId = selectedCustomerForNotification.customer?._id || selectedCustomerForNotification.customer;

            const payload = {
                recipientId,
                message,
                type: isCancellation ? 'appointment_cancelled' : 'general',
                tokenId
            };

            console.log('Sending notification payload:', payload);

            await api.post('/notifications/send', payload);
            toast.success('Notification sent to customer');
            setSelectedCustomerForNotification(null);
        } catch (err) {
            toast.error('Failed to send notification');
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

    const filteredTokens = filter === 'all'
        ? tokens
        : tokens.filter(t => t.status === filter);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Queue Control Panel</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Live operations and token monitoring</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select
                        className="form-control"
                        style={{ width: 'auto', fontSize: '0.85rem' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Active</option>
                        <option value="waiting">Waiting</option>
                        <option value="serving">Serving</option>
                        <option value="arrived">Arrived</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleCallNext}>
                        <Bell size={16} style={{ marginRight: '6px' }} /> Call Next
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setIsWalkInModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)' }}>
                        <UserPlus size={16} /> Add Walk-in
                    </button>
                    <Link to="/admin/check-in" className="btn btn-outline-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Scan size={16} /> Scan Arrival
                    </Link>
                    <button className="btn btn-secondary btn-sm" onClick={fetchActiveTokens}>Refresh</button>
                </div>
            </div>

            <div className="grid-1">
                {filteredTokens.length > 0 ? (
                    filteredTokens.map((token, index) => (
                        <div key={token._id} className="card" style={{ marginBottom: '1rem', borderLeft: `6px solid ${token.status === 'serving' ? 'var(--success)' : token.status === 'arrived' ? 'var(--primary)' : 'var(--warning)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Token</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{token.tokenNumber}</div>
                                    </div>

                                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h4 style={{ margin: 0 }}>{token.customer?.name || token.customerName || 'Walk-in Customer'}</h4>
                                            {token.arrivalStatus === 'arrived' && (
                                                <span className="badge badge-arrived" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                                                    <MapPin size={10} /> Arrived
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {token.service?.name || 'Unknown Service'} • {token.timeSlot} • Staff: {token.staff?.name || 'No Staff Assigned'}
                                        </div>
                                        {token.addOnServices && token.addOnServices.length > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                                                + {token.addOnServices.length} Add-on(s) (₹{token.addOnServices.reduce((sum, item) => sum + (item.price || 0), 0)})
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                                        <div className={`badge badge-${token.status}`}>{token.status.toUpperCase()}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Position: {index + 1}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {token.status === 'waiting' && (
                                            <>
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => handleStatusUpdate(token._id, 'arrived')}
                                                    title="Mark as Arrived"
                                                >
                                                    <Scan size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleStatusUpdate(token._id, 'serving')}
                                                >
                                                    <Play size={16} style={{ marginRight: '6px' }} /> Start
                                                </button>
                                            </>
                                        )}
                                        {token.status === 'arrived' && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleStatusUpdate(token._id, 'serving')}
                                            >
                                                <Play size={16} style={{ marginRight: '6px' }} /> Start
                                            </button>
                                        )}
                                        {token.status === 'serving' && (
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleOpenPayment(token)}
                                            >
                                                <CheckCircle size={16} style={{ marginRight: '6px' }} /> Finish
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => setSelectedTokenForAddOn(token)}
                                            title="Add Service"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleStatusUpdate(token._id, 'cancelled')}
                                        >
                                            <XCircle size={16} />
                                        </button>
                                        {token.customer && token.customer._id && (
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setSelectedCustomerForNotification(token)}
                                                title="Send Notification"
                                            >
                                                <Bell size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state card">
                        <Users className="empty-state-icon" />
                        <h3>No Active Tokens</h3>
                        <p>The queue is currently clear.</p>
                    </div>
                )}
            </div>

            <WalkInModal
                isOpen={isWalkInModalOpen}
                onClose={() => setIsWalkInModalOpen(false)}
                onSuccess={fetchActiveTokens}
            />

            {selectedCustomerForNotification && (
                <NotificationModal
                    isOpen={!!selectedCustomerForNotification}
                    onClose={() => setSelectedCustomerForNotification(null)}
                    onSend={handleSendNotification}
                    customerName={selectedCustomerForNotification.customer?.name}
                />
            )}

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
                    onSuccess={fetchActiveTokens}
                />
            )}
        </div>
    );
};

export default QueueControl;
