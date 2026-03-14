import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, Clock,
    DollarSign, Download, Filter, Calendar, MessageSquare, Star
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [staffRatings, setStaffRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7d');
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [resData, resReviews, resLoyalty] = await Promise.all([
                    api.get(`/admin/dashboard?range=${dateRange}`),
                    api.get(`/reviews`),
                    api.get('/loyalty/leaderboard')
                ]);
                setData(resData.data);

                const allReviews = resReviews.data.reviews || [];
                setReviews(allReviews);

                if (resLoyalty.data.success) {
                    setLeaderboard(resLoyalty.data.leaderboard);
                }

                // Calculate average rating per staff member
                const sRates = {};
                allReviews.forEach(r => {
                    const sname = r.staff?.name || 'Unassigned';
                    if (!sRates[sname]) sRates[sname] = { sum: 0, count: 0 };
                    sRates[sname].sum += r.rating;
                    sRates[sname].count += 1;
                });

                const sStats = Object.keys(sRates).map(k => ({
                    name: k,
                    avg: (sRates[k].sum / sRates[k].count).toFixed(1),
                    count: sRates[k].count
                })).sort((a, b) => b.avg - a.avg);

                setStaffRatings(sStats);
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
                    <h3 style={{ marginBottom: '1.5rem' }}>Tokens per Time Slot</h3>
                    {hourlyDistribution && hourlyDistribution.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={hourlyDistribution}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }} itemStyle={{ color: 'var(--primary)', fontWeight: 600 }} />
                                    <Area type="monotone" name="Tokens" dataKey="count" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No data available for the selected period.</p>
                        </div>
                    )}
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
                    {topServices && topServices.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={topServices}
                                    nameKey="name"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {topServices.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }} />
                            </PieChart>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                            <p style={{ color: 'var(--text-muted)' }}>No top services data.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 NEW LOYALTY OVERVIEW SECTION */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>★</div>
                    <h3 style={{ margin: 0 }}>Loyalty Leaderboard (Top Customers)</h3>
                </div>

                {leaderboard && leaderboard.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Rank</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Customer</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Tier</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Current Points</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Lifetime Earned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((loyalty, index) => (
                                    <tr key={loyalty._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 700 }}>#{index + 1}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{loyalty.customer?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{loyalty.customer?.email || ''}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                                                background: loyalty.tier === 'gold' ? '#fff9e6' : loyalty.tier === 'silver' ? '#f1f5f9' : '#fce7f3',
                                                color: loyalty.tier === 'gold' ? '#d97706' : loyalty.tier === 'silver' ? '#64748b' : 'var(--primary)'
                                            }}>
                                                {(loyalty.tier || 'bronze').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{loyalty.totalPoints}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{loyalty.lifetimeEarned}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No loyalty data available.</p>
                    </div>
                )}
            </div>

            {/* 🔥 NEW FEEDBACK SECTION */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ margin: 0 }}>Customer Feedback & Reviews</h3>
                </div>

                {staffRatings.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {staffRatings.map(s => (
                            <div key={s.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '140px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '1.25rem' }}>
                                    {s.avg} <Star size={18} fill="#ffb400" color="#ffb400" />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>({s.count})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {reviews.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Customer</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Service</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Staff</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Rating</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Comment</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{review.customer?.name || 'Unknown'}</div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {review.service?.name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {review.staff?.name || 'Unassigned'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ffb400' }}>
                                                {review.rating} <Star size={14} fill="#ffb400" />
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={review.comment}>
                                            "{review.comment || 'No comment'}"
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <MessageSquare className="empty-state-icon" />
                        <h3>No feedback submitted yet</h3>
                        <p>There are no customer reviews available at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
