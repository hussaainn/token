import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Ticket, DollarSign, TrendingUp, Clock, AlertCircle,
    ChevronRight, ArrowUpRight, ArrowDownRight, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import WalkInModal from '../../components/WalkInModal';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

    useEffect(() => {
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
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <Link to="/admin/queue" className="card action-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #8b85ff 100%)',
                    color: '#fff',
                    padding: '1.5rem',
                    transition: 'transform 0.2s'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '1rem' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff' }}>Queue Control</h3>
                        <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Manage live tokens and call customers</p>
                    </div>
                    <ChevronRight size={24} style={{ marginLeft: 'auto' }} />
                </Link>

                <Link to="/admin/check-in" className="card action-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
                    color: '#fff',
                    padding: '1.5rem',
                    transition: 'transform 0.2s'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '1rem' }}>
                        <Ticket size={32} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff' }}>Check-in Scanner</h3>
                        <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Scan QR codes for customer arrival</p>
                    </div>
                    <ChevronRight size={24} style={{ marginLeft: 'auto' }} />
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
                <div className="card stat-card">
                    <p className="stat-card-label">Active Tokens</p>
                    <h1 className="stat-card-value">{stats.activeTokens}</h1>
                    <Ticket size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--primary)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        <ArrowUpRight size={14} /> 12% vs yesterday
                    </div>
                </div>

                <div className="card stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
                    <p className="stat-card-label">Today's Revenue</p>
                    <h1 className="stat-card-value">₹{stats.revenueToday}</h1>
                    <DollarSign size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--accent)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        <ArrowUpRight size={14} /> 8% vs average
                    </div>
                </div>

                <div className="card stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
                    <p className="stat-card-label">Total Customers</p>
                    <h1 className="stat-card-value">{stats.totalCustomers}</h1>
                    <Users size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--secondary)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        <ArrowUpRight size={14} /> 2 new today
                    </div>
                </div>

                <div className="card stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <p className="stat-card-label">Completion Rate</p>
                    <h1 className="stat-card-value">{stats.totalTokensToday > 0 ? Math.round((stats.completedToday / stats.totalTokensToday) * 100) : 0}%</h1>
                    <TrendingUp size={32} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'var(--warning)' }} />
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
                            <span style={{ fontWeight: 700 }}>{stats.completedToday}</span>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Cancellations / No-shows</span>
                            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{stats.cancelledToday}</span>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(108,99,255,0.1)', borderRadius: 'var(--radius)', marginTop: 'auto' }}>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>AI Insight</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Peak hours are expected between 2 PM and 4 PM today. Consider assigning an additional staff member to the hair category.
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
