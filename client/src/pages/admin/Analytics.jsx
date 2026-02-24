import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, Clock,
    DollarSign, Download, Filter, Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get(`/admin/dashboard?range=${dateRange}`);
                setData(res.data);
            } catch (err) {
                console.error('Error fetching analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [dateRange]);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const { stats, topServices, hourlyDistribution, staffPerformance } = data;

    const COLORS = ['#6c63ff', '#00d4aa', '#ff6b9d', '#f59e0b', '#3b82f6'];

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Reports & Analytics</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Detailed insights into salon performance and customer trends</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select
                        className="form-control"
                        style={{ width: 'auto' }}
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <button className="btn btn-secondary btn-sm">
                        <Download size={16} style={{ marginRight: '6px' }} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <p className="stat-card-label">Revenue Growth</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>₹45,200</h1>
                        <span style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <TrendingUp size={16} /> +14.2%
                        </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Average daily: ₹6,457</p>
                </div>
                <div className="card">
                    <p className="stat-card-label">Customer Retention</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>68%</h1>
                        <span style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <TrendingUp size={16} /> +2.1%
                        </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Repeat customers this week</p>
                </div>
                <div className="card">
                    <p className="stat-card-label">Avg. Service Time</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>42m</h1>
                        <span style={{ color: 'var(--danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <TrendingDown size={16} /> -3m
                        </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Efficient staff operations</p>
                </div>
            </div>

            <div className="grid-1" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Revenue Trend</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart data={[
                                { date: 'Mon', revenue: 4000 },
                                { date: 'Tue', revenue: 3000 },
                                { date: 'Wed', revenue: 5500 },
                                { date: 'Thu', revenue: 4800 },
                                { date: 'Fri', revenue: 7000 },
                                { date: 'Sat', revenue: 8500 },
                                { date: 'Sun', revenue: 7200 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Staff Workload vs Ratings</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={staffPerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend iconType="circle" />
                                <Bar dataKey="completed" name="Tokens Handled" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Income Distribution by Category</h3>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                        <PieChart width={300} height={300}>
                            <Pie
                                data={topServices}
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="count"
                            >
                                {topServices.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
