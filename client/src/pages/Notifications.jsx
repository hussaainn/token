import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { BellOff, Check, Calendar, Ticket, Info, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (newNotif) => {
            console.log("📩 New Notification:", newNotif);
            setNotifications(prev => [newNotif, ...prev]);
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');

            // Defensive safety (prevents object crashes)
            const safeData = Array.isArray(res.data?.notifications)
                ? res.data.notifications
                : [];

            setNotifications(safeData);

            if (res.data?.unreadCount > 0) {
                api.patch('/notifications/read-all')
                    .then(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))))
                    .catch(err => console.error('Failed to mark read on open:', err));
            }

        } catch (err) {
            console.error(err);
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load notifications"
            );
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);

            setNotifications(prev =>
                prev.map(n =>
                    n._id === id ? { ...n, read: true } : n
                )
            );

        } catch (err) {
            console.error(err);
            toast.error(
                err?.response?.data?.message ||
                "Failed to update notification"
            );
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');

            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );

            toast.success('All marked as read');

        } catch (err) {
            console.error(err);
            toast.error(
                err?.response?.data?.message ||
                "Failed to update notifications"
            );
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'token_update':
                return <Ticket size={18} className="text-primary" />;
            case 'appointment_reminder':
                return <Calendar size={18} className="text-accent" />;
            case 'safety_alert':
                return <AlertTriangle size={18} className="text-danger" />;
            default:
                return <Info size={18} className="text-secondary" />;
        }
    };

    const safeFormatDate = (date) => {
        try {
            return format(new Date(date), 'MMM dd, HH:mm');
        } catch {
            return "Invalid date";
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Notifications</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Stay updated with your queue status and salon alerts
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={markAllRead}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="grid-1">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div
                            key={notif._id}
                            className={`card notification-item ${notif.read ? 'read' : 'unread'}`}
                            style={{
                                marginBottom: '0.75rem',
                                background: notif.read
                                    ? 'var(--surface)'
                                    : 'rgba(108,99,255,0.05)',
                                borderLeft: `4px solid ${notif.read
                                    ? 'transparent'
                                    : 'var(--primary)'}`,
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'flex-start',
                                padding: '1.25rem'
                            }}
                        >
                            <div style={{ marginTop: '4px' }}>
                                {getTypeIcon(notif.type)}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.25rem'
                                }}>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        fontWeight: notif.read ? 600 : 700
                                    }}>
                                        {String(notif.title || "Notification")}
                                    </h4>

                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {safeFormatDate(notif.createdAt)}
                                    </span>
                                </div>

                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.5
                                }}>
                                    {String(notif.message || "")}
                                </p>

                                {!notif.read && (
                                    <button
                                        onClick={() => markAsRead(notif._id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            padding: 0,
                                            marginTop: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Check size={14} />
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state card">
                        <BellOff className="empty-state-icon" />
                        <h3>No Notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;