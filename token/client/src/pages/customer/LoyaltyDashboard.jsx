import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Star, Gift, TrendingUp, Award, ChevronRight } from 'lucide-react';

const TIER_STYLES = {
    bronze: { color: '#cd7f32', bg: '#fdf3e7', emoji: '🥉' },
    silver: { color: '#9e9e9e', bg: '#f5f5f5', emoji: '🥈' },
    gold: { color: '#f59e0b', bg: '#fffbeb', emoji: '🥇' },
    platinum: { color: '#7c3aed', bg: '#f5f3ff', emoji: '💎' },
};

const TIER_PERKS = {
    bronze: ['Earn 1 point per ₹100 spent', 'Access to exclusive offers'],
    silver: ['10% discount on all services', 'Priority queue access', 'Birthday bonus points'],
    gold: ['20% discount on all services', 'Free add-on service monthly', 'VIP queue position'],
    platinum: ['30% discount on all services', 'Free service every 10 visits', 'Personal stylist assignment', 'Exclusive platinum events'],
};

const LoyaltyDashboard = () => {
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [redeemAmount, setRedeemAmount] = useState(100);

    useEffect(() => {
        fetchLoyalty();
    }, []);

    const fetchLoyalty = async () => {
        try {
            const res = await api.get('/loyalty/me');
            setLoyalty(res.data);
        } catch (err) {
            toast.error('Failed to load loyalty data');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (redeemAmount > loyalty.points) {
            toast.error('Not enough points');
            return;
        }
        setRedeeming(true);
        try {
            const res = await api.post('/loyalty/redeem', { pointsToRedeem: redeemAmount });
            toast.success(res.data.message);
            fetchLoyalty();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Redemption failed');
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    if (!loyalty) return null;

    const tierStyle = TIER_STYLES[loyalty.tier] || TIER_STYLES.bronze;
    const allTiers = ['bronze', 'silver', 'gold', 'platinum'];
    const thresholds = [0, 200, 500, 1000];

    return (
        <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>

            {/* Hero Tier Card */}
            <div className="card" style={{
                background: `linear-gradient(135deg, ${tierStyle.color}22, ${tierStyle.color}44)`,
                border: `2px solid ${tierStyle.color}`,
                marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{tierStyle.emoji}</div>
                <h1 style={{ color: tierStyle.color, margin: 0, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {loyalty.tier} Member
                </h1>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: tierStyle.color, margin: '0.5rem 0' }}>
                    {loyalty.points}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Loyalty Points</div>

                {loyalty.discountPercent > 0 && (
                    <div style={{
                        marginTop: '1rem', display: 'inline-block',
                        background: tierStyle.color, color: '#fff',
                        padding: '0.5rem 1.5rem', borderRadius: '2rem',
                        fontWeight: 700, fontSize: '1rem'
                    }}>
                        🎉 {loyalty.discountPercent}% Discount Active on All Services
                    </div>
                )}
            </div>

            {/* Progress to Next Tier */}
            {loyalty.nextTier && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 600 }}>Progress to {loyalty.nextTier.charAt(0).toUpperCase() + loyalty.nextTier.slice(1)}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {loyalty.pointsToNextTier} points to go
                        </span>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', height: '12px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: '1rem',
                            background: `linear-gradient(90deg, ${tierStyle.color}, ${TIER_STYLES[loyalty.nextTier]?.color})`,
                            width: `${loyalty.progressToNext}%`, transition: 'width 0.5s ease'
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{loyalty.points} pts</span>
                        <span>{loyalty.nextThreshold} pts</span>
                    </div>
                </div>
            )}

            {/* Tier Roadmap */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>🏆 Tier Roadmap</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {allTiers.map((tier, i) => {
                        const s = TIER_STYLES[tier];
                        const isActive = tier === loyalty.tier;
                        const isUnlocked = loyalty.points >= thresholds[i];
                        return (
                            <div key={tier} style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: isUnlocked ? s.color : 'var(--bg-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 0.5rem', fontSize: '1.4rem',
                                    border: isActive ? `3px solid ${s.color}` : '3px solid transparent',
                                    boxShadow: isActive ? `0 0 12px ${s.color}66` : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    {TIER_STYLES[tier].emoji}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 400, color: isActive ? s.color : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {tier}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{thresholds[i]}+ pts</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Redeem Points */}
            {loyalty.redeemablePoints >= 100 && (
                <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '0.25rem' }}>🎁 Redeem Points</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                        100 points = ₹10 discount • You have <strong>{loyalty.redeemablePoints}</strong> redeemable points (worth <strong>₹{loyalty.redeemableValue}</strong>)
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                                Points to Redeem (multiples of 100)
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                value={redeemAmount}
                                min={100}
                                max={loyalty.redeemablePoints}
                                step={100}
                                onChange={e => setRedeemAmount(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '120px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You'll save</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
                                ₹{(redeemAmount * 0.1).toFixed(0)}
                            </div>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleRedeem}
                        disabled={redeeming || redeemAmount > loyalty.points || redeemAmount < 100}
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        {redeeming ? 'Redeeming...' : `Redeem ${redeemAmount} Points for ₹${(redeemAmount * 0.1).toFixed(0)} Off`}
                    </button>
                </div>
            )}

            {/* Current Tier Perks */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>✨ Your {loyalty.tier.charAt(0).toUpperCase() + loyalty.tier.slice(1)} Perks</h3>
                {TIER_PERKS[loyalty.tier].map((perk, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < TIER_PERKS[loyalty.tier].length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ color: tierStyle.color, fontWeight: 700 }}>✓</div>
                        <span>{perk}</span>
                    </div>
                ))}
            </div>

            {/* How to Earn */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>💡 How to Earn Points</h3>
                {[
                    { action: 'Complete a service', points: '1 point per ₹100 spent' },
                    { action: 'Leave a review', points: '+10 bonus points' },
                    { action: 'Refer a friend', points: '+50 bonus points' },
                    { action: 'Birthday month', points: '+25 bonus points' },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.action}</span>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.points}</span>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default LoyaltyDashboard;
