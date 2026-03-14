import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
<<<<<<< HEAD
import { useAuth } from '../../context/AuthContext';
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
import api from '../../api/axios';
import { Users, Clock, Calendar, Ticket, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const LiveQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
<<<<<<< HEAD
    const { user } = useAuth();
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await api.get('/tokens/queue');
                setQueue(res.data.queue);
            } catch (err) {
                console.error('Error fetching queue:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit('join:queue');

            socket.on('queue:update', (updatedQueue) => {
                setQueue(updatedQueue);
            });

            return () => {
                socket.off('queue:update');
            };
        }
    }, [socket]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    const currentlyServing = queue.filter(t => t.status === 'serving');
    const waiting = queue.filter(t => t.status === 'waiting');

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Live Queue Status</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        <span className="live-dot" style={{ marginRight: '8px' }}></span>
                        Real-time updates for {format(new Date(), 'MMMM dd, yyyy')}
                    </p>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="stat-card-label">Currently Serving</p>
                            <h1 className="stat-card-value">{currentlyServing.length}</h1>
                        </div>
                        <Users size={32} style={{ color: 'var(--success)', opacity: 0.5 }} />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        {currentlyServing.length > 0 ? (
                            currentlyServing.map(token => (
                                <div key={token._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <div className="badge badge-serving">{token.tokenNumber}</div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{token.service.name}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No tokens currently being served</p>
                        )}
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="stat-card-label">Waiting in Queue</p>
                            <h1 className="stat-card-value">{waiting.length}</h1>
                        </div>
                        <Clock size={32} style={{ color: 'var(--warning)', opacity: 0.5 }} />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Avg. wait time: <span style={{ fontWeight: 700, color: 'var(--text)' }}>~25 mins</span>
                        </p>
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Next in Line</h3>
            <div className="queue-list">
                {waiting.length > 0 ? (
                    waiting.map((token, index) => (
                        <div key={token._id} className="queue-item">
                            <div className="queue-position">{index + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span className="token-number" style={{ minWidth: 'auto', fontSize: '1.1rem' }}>{token.tokenNumber}</span>
                                    <span style={{ fontWeight: 600 }}>{token.customer.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Ticket size={14} /> {token.service.name}
                                    </span>
                                    {token.staff && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Users size={14} /> {token.staff.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="badge badge-waiting">Waiting</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    Slot: {token.timeSlot}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state card">
                        <Ticket className="empty-state-icon" />
                        <h3>Queue is Empty</h3>
                        <p>There are no customers currently waiting in the queue.</p>
<<<<<<< HEAD
                        {!['admin', 'staff'].includes(user?.role) && (
                            <a href="/customer/book" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Book a Service</a>
                        )}
=======
                        <a href="/customer/book" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Book a Service</a>
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
                    </div>
                )}
            </div>

<<<<<<< HEAD
            {!['admin', 'staff'].includes(user?.role) && (
                <div className="card" style={{ marginTop: '3rem', background: 'var(--bg-secondary)', border: 'none' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={40} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Want to skip the line?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Book an appointment in advance and get notified when it's your turn.</p>
                            <a href="/customer/book" className="btn btn-primary btn-sm">
                                Schedule Appointment <ChevronRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
=======
            <div className="card" style={{ marginTop: '3rem', background: 'var(--bg-secondary)', border: 'none' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={40} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Want to skip the line?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Book an appointment in advance and get notified when it's your turn.</p>
                        <a href="/customer/book" className="btn btn-primary btn-sm">
                            Schedule Appointment <ChevronRight size={16} />
                        </a>
                    </div>
                </div>
            </div>
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
        </div>
    );
};

export default LiveQueue;
