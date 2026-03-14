import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Ticket, DollarSign, TrendingUp, Clock, AlertCircle,
    ChevronRight, ArrowUpRight, ArrowDownRight, UserPlus, CheckCircle,
    Navigation, MapPin, AlertTriangle, UserX
} from 'lucide-react';
import { format } from 'date-fns';
import WalkInModal from '../../components/WalkInModal';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
    const [arrivalFeed, setArrivalFeed] = useState([]);
    const [enRouteCustomers, setEnRouteCustomers] = useState([]);
    const [noShowFeed, setNoShowFeed] = useState([]);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;
        socket.on('join:admin', () => {
            // joined
        });

        // Customer is on their way with ETA
        socket.on('customer:onway', (data) => {
            setEnRouteCustomers(prev => {
                const exists = prev.find(c => c.tokenId === data.tokenId);
                if (exists) {
                    return prev.map(c => c.tokenId === data.tokenId
                        ? { ...c, ...data, updatedAt: new Date() }
                        : c
                    );
                }
                toast(`🚗 ${data.customerName} is on their way! ETA: ${data.eta}`, {
                    duration: 4000, icon: '🚗'
                });
                return [{ ...data, updatedAt: new Date() }, ...prev].slice(0, 8);
            });
        });

        socket.on('token:customerArrived', (arrivedData) => {
            setEnRouteCustomers(prev => prev.filter(c => c.tokenId !== arrivedData.tokenId));
            toast.success(
                `📍 ${arrivedData.customerName} has arrived! Token ${arrivedData.tokenNumber} — ${arrivedData.serviceName}`,
                { duration: 6000, icon: '🚶' }
            );
            setArrivalFeed(prev => [{ ...arrivedData, id: Date.now() }, ...prev].slice(0, 10));
        });

        socket.on('token:noshow', (data) => {
            setNoShowFeed(prev => [{ ...data, id: Date.now(), time: new Date() }, ...prev].slice(0, 5));
            toast.error(
                `⏰ No-show: Token ${data.tokenNumber} — ${data.customerName} missed their slot`,
                { duration: 5000 }
            );
        });

        return () => {
            socket.off('token:customerArrived');
            socket.off('token:noshow');
            socket.off('customer:onway');
        };
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.emit('join:admin');
        }
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setData(res.data);
            } catch (err) {
                console.error('Error fetching dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const { stats, topServices, hourlyDistribution, staffPerformance } = data;

    const COLORS = ['#6c63ff', '#00d4aa', '#ff6b9d', '#f59e0b', '#3b82f6'];

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Admin Dashboard</h2>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsWalkInModalOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)' }}
                >
                    <UserPlus size={18} /> Add Walk-in
                </button>
            </div>

            {/* Quick Actions */}
            <h3 style={{ marginBottom: '1rem', marginTop: '1rem' }}>Quick Actions</h3>
            {arrivalFeed.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--success)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>🚶 Live Arrivals</h3>
                    {arrivalFeed.map(arrival => (
                        <div key={arrival.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.75rem 0', borderBottom: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{arrival.customerName}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {arrival.serviceName} • Token {arrival.tokenNumber} • {arrival.timeSlot}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    background: arrival.via === 'geo' ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,143,0.1)',
                                    color: arrival.via === 'geo' ? 'var(--success)' : 'var(--primary)',
                                    padding: '2px 10px', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700
                                }}>
                                    {arrival.via === 'geo' ? '📍 Geo Auto' : '📷 QR Scan'}
                                </span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {new Date(arrival.arrivedAt).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {enRouteCustomers.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Navigation size={20} color="var(--primary)" />
                        Customers En Route
                        <span style={{
                            background: 'var(--primary)', color: '#fff',
                            borderRadius: '1rem', padding: '2px 10px',
                            fontSize: '0.75rem', marginLeft: '0.25rem'
                        }}>{enRouteCustomers.length}</span>
                    </h3>
                    {enRouteCustomers.map((c, i) => (
                        <div key={c.tokenId} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: i < enRouteCustomers.length - 1 ? '1px solid var(--border)' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'rgba(244,63,143,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}>🚗</div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{c.customerName}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Token {c.tokenNumber} • Slot: {c.timeSlot}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                                    {c.distance >= 1000
                                        ? `${(c.distance / 1000).toFixed(1)} km`
                                        : `${c.distance}m`}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    ETA: <strong>{c.eta}</strong>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    Updated {new Date(c.updatedAt).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
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
                    </div>
                </button>

                <Link to="/admin/queue" className="card action-card" style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #8b85ff 100%)',
                    color: '#fff', padding: '1.5rem'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>View Live Queue</h4>
                    </div>
                </Link>

                <Link to="/admin/staff" className="card action-card" style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none',
                    background: 'linear-gradient(135deg, var(--warning) 0%, #facc15 100%)',
                    color: '#fff', padding: '1.5rem'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Manage Staff</h4>
                    </div>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
                <div className="card stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
                    <p className="stat-card-label">No-shows Today</p>
                    <h1 className="stat-card-value">{stats.noShowToday || stats.cancelledToday || 0}</h1>
                    <UserX size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--danger)' }} />
                </div>

                <div className="card stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <p className="stat-card-label">Completed Services</p>
                    <h1 className="stat-card-value">{stats.completedToday}</h1>
                    <CheckCircle size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--success)' }} />
                </div>

                <div className="card stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <p className="stat-card-label">Waiting / Serving</p>
                    <h1 className="stat-card-value">{stats.activeTokens}</h1>
                    <Clock size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--warning)' }} />
                </div>

                <div className="card stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
                    <p className="stat-card-label">Today's Revenue</p>
                    <h1 className="stat-card-value">₹{stats.revenueToday}</h1>
                    <DollarSign size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--accent)' }} />
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {/* Hourly Distribution Chart */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} /> Peak Hour Traffic
                    </h3>
                    <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }}
                                    itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                                />
                                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Services Chart */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Service Popularity</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '50%', height: 260, minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topServices}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {topServices.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ width: '50%' }}>
                            {topServices.map((service, index) => (
                                <div key={service.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: COLORS[index % COLORS.length] }}></div>
                                    <span style={{ fontSize: '0.85rem', flex: 1 }}>{service.name}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{service.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Staff Performance */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> Staff Performance
                        </h3>
                        <Link to="/admin/staff" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Manage Staff</Link>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Staff Member</th>
                                    <th>Completed</th>
                                    <th>Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffPerformance.map(s => (
                                    <tr key={s.name}>
                                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                                        <td>{s.completed} tokens</td>
                                        <td><span className="badge badge-success">+5%</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Health / Alerts */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} /> Today's Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Completed Services</span>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{stats.completedToday}</span>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Cancellations / No-shows</span>
                            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{stats.cancelledToday}</span>
                        </div>

                        {/* Live no-show feed */}
                        {noShowFeed.length > 0 && (
                            <div style={{ border: '1px solid var(--danger)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                                <div style={{ background: 'rgba(239,68,68,0.08)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <UserX size={14} color="var(--danger)" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)' }}>Recent No-shows</span>
                                </div>
                                {noShowFeed.map(ns => (
                                    <div key={ns.id} style={{
                                        padding: '0.6rem 1rem', display: 'flex',
                                        justifyContent: 'space-between', borderTop: '1px solid var(--border)'
                                    }}>
                                        <span style={{ fontSize: '0.85rem' }}>{ns.customerName}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Token {ns.tokenNumber} • {new Date(ns.time).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ padding: '1.5rem', background: 'rgba(244,63,143,0.1)', borderRadius: 'var(--radius)', marginTop: 'auto' }}>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Pro Tip</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Encourage staff to cross-sell add-on services during peak hours to maximize today's revenue.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <WalkInModal
                isOpen={isWalkInModalOpen}
                onClose={() => setIsWalkInModalOpen(false)}
                // Don't have a specific queue fetch here, but reloading the whole page or letting Socket.IO handle it works
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
};

export default Dashboard;
