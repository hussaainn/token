import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Award, ShoppingBag, TrendingUp, History, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoyaltyDashboard = () => {
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoyalty();
    }, []);

    const fetchLoyalty = async () => {
        try {
            const res = await api.get('/loyalty/me');
            setLoyalty(res.data.loyalty);
        } catch (err) {
            console.error('Error fetching loyalty data');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (points) => {
        try {
            const res = await api.post('/loyalty/redeem', { points });
            toast.success(res.data.message);
            fetchLoyalty();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Redemption failed');
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const tierColors = {
        bronze: '#cd7f32',
        silver: '#aaa9ad',
        gold: '#ffd700',
        platinum: '#e5e4e2'
    };

    const nextTierPoints = loyalty.totalPoints < 200 ? 200 : loyalty.totalPoints < 500 ? 500 : 1000;
    const progress = (loyalty.totalPoints / nextTierPoints) * 100;

    return (
        <div className="fade-in">
            <div className="section-header">
                <h2 className="section-title">Loyalty Rewards</h2>
                <div className={`badge tier-${loyalty.tier}`} style={{ background: `${tierColors[loyalty.tier]}20`, color: tierColors[loyalty.tier], fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                    <Award size={16} style={{ marginRight: '6px' }} />
                    {loyalty.tier.toUpperCase()} TIER
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
                    <p className="stat-card-label">Current Points</p>
                    <h1 className="stat-card-value">{loyalty.totalPoints}</h1>
                    <Sparkles className="stat-card-icon" />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10 points = ₹5 DISCOUNT</p>
                </div>
                <div className="card stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
                    <p className="stat-card-label">Lifetime Earned</p>
                    <h1 className="stat-card-value">{loyalty.lifetimeEarned}</h1>
                    <TrendingUp className="stat-card-icon" />
                </div>
                <div className="card stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
                    <p className="stat-card-label">Rewards Redeemed</p>
                    <h1 className="stat-card-value">₹{Math.floor(loyalty.lifetimeRedeemed / 2)}</h1>
                    <ShoppingBag className="stat-card-icon" />
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Progress and Redemption */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Tier Progress</h3>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 600 }}>To Next Tier</span>
                            <span style={{ color: 'var(--text-muted)' }}>{loyalty.totalPoints} / {nextTierPoints} pts</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Earn {nextTierPoints - loyalty.totalPoints} more points to reach {loyalty.tier === 'bronze' ? 'Silver' : loyalty.tier === 'silver' ? 'Gold' : 'Platinum'} Tier.
                        </p>
                    </div>

                    <h3 style={{ marginBottom: '1rem' }}>Redeem Points</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[100, 200, 500].map(pts => (
                            <div key={pts} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                opacity: loyalty.totalPoints < pts ? 0.6 : 1
                            }}>
                                <div>
                                    <p style={{ fontWeight: 700 }}>₹{Math.floor(pts / 2)} Discount Voucher</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Requires {pts} points</p>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    disabled={loyalty.totalPoints < pts}
                                    onClick={() => handleRedeem(pts)}
                                >
                                    Redeem
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius)', marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                        <AlertCircle size={20} style={{ color: 'var(--warning)', mt: '2px' }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Redeemed vouchers will be automatically applied to your next service booking.
                        </p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={20} /> Reward History
                    </h3>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Activity</th>
                                    <th>Points</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loyalty.history.length > 0 ? (
                                    loyalty.history.slice().reverse().map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.description}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.type.toUpperCase()}</p>
                                            </td>
                                            <td style={{ fontWeight: 700, color: item.type === 'earned' ? 'var(--success)' : 'var(--danger)' }}>
                                                {item.type === 'earned' ? '+' : '-'}{item.points}
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {format(new Date(item.date), 'MMM dd, yyyy')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No history yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyDashboard;
