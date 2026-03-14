import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import {
    CalendarPlus, List, Clock, MessageSquare,
    Star, Award, ChevronRight, Ticket, History
} from 'lucide-react';
import GeoArrivalCard from '../components/GeoArrivalCard';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // States for customer dashboard
    const [tokens, setTokens] = useState([]);
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'customer') {
            const fetchDashboardData = async () => {
                try {
                    const [tokensRes, loyaltyRes] = await Promise.all([
                        api.get('/tokens/my'),
                        api.get('/loyalty/me').catch(() => ({ data: { success: false } })) // Fallback if no loyalty
                    ]);

                    setTokens(tokensRes.data.tokens || []);
                    if (loyaltyRes.data && loyaltyRes.data.success) {
                        setLoyalty(loyaltyRes.data);
                    }
                } catch (err) {
                    console.error('Error fetching dashboard data:', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    // Public / Guest View
    if (!isAuthenticated || user?.role !== 'customer') {
        return (
            <div className="fade-in">
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>
                        Welcome to <span style={{ color: 'var(--primary)' }}>Mercy Salon</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Experience premium beauty services with our smart queue management system. No more waiting in long lines.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn btn-primary btn-lg">Login to Book</Link>
                        <Link to="/queue" className="btn btn-secondary btn-lg">View Live Queue</Link>
                    </div>
                </div>

                <div className="grid-3" style={{ marginTop: '2rem' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: 60, height: 60, background: 'rgba(244, 63, 143, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Clock size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.75rem' }}>Smart Booking</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Book your slot online and track your exact waiting time in real-time before you arrive.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: 60, height: 60, background: 'rgba(244, 63, 143, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Award size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.75rem' }}>Loyalty Rewards</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Earn points for every service and redeem them for exciting discounts on your next visit.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: 60, height: 60, background: 'rgba(244, 63, 143, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Star size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.75rem' }}>Premium Service</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Enjoy top-tier treatments from our expert professionals tailored just for you.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Customer Dashboard View
    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const upcomingTokens = tokens.filter(t => ['waiting', 'serving'].includes(t.status));
    const pastTokens = tokens.filter(t => !['waiting', 'serving'].includes(t.status)).slice(0, 3);
    const nextAppointment = upcomingTokens[0];
    const activeToken = tokens.find(t => ['waiting', 'arrived'].includes(t.status) && new Date(t.date).toDateString() === new Date().toDateString());

    return (
        <div className="fade-in">
            {activeToken && <GeoArrivalCard activeToken={activeToken} />}

            {/* 1. Welcome Card & Loyalty Tier */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #ff8da1 100%)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#fff' }}>Hello, {user.name.split(' ')[0]}! ✨</h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>Welcome back to Mercy Salon</p>
                </div>

                {loyalty ? (
                    <div className="card" style={{
                        background: `linear-gradient(135deg, #f59e0b22, #f59e0b44)`,
                        border: '2px solid #f59e0b', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }} onClick={() => navigate('/customer/loyalty')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Loyalty Points</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>{loyalty.points}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                    {loyalty.tier} Member {loyalty.discountPercent > 0 ? `• ${loyalty.discountPercent}% discount active` : ''}
                                </div>
                            </div>
                            <div style={{ fontSize: '3rem' }}>
                                {loyalty.tier === 'platinum' ? '💎' : loyalty.tier === 'gold' ? '🥇' : loyalty.tier === 'silver' ? '🥈' : '🥉'}
                            </div>
                        </div>
                        {loyalty.nextTier && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', height: '6px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: '1rem', background: '#f59e0b', width: `${loyalty.progressToNext}%` }} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {loyalty.pointsToNextTier} points to {loyalty.nextTier}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Loading loyalty...</p>
                    </div>
                )}
            </div>

            {/* 2. Next Appointment Card */}
            {nextAppointment ? (
                <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} color="var(--primary)" /> Next Appointment
                        </h3>
                        <span className={`badge badge-${nextAppointment.status}`}>{nextAppointment.status.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: '0 0 0.25rem 0' }}>{nextAppointment.service?.name}</h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CalendarPlus size={16} /> {format(new Date(nextAppointment.date), 'MMMM dd, yyyy')} • {nextAppointment.timeSlot}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Token Number</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{nextAppointment.tokenNumber}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                        <Link to="/customer/tokens" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>View Details / Track Arrival</Link>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>Ready for a fresh look?</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>You have no upcoming appointments.</p>
                    </div>
                    <Link to="/customer/book" className="btn btn-primary">Book Now</Link>
                </div>
            )}

            <div className="grid-2">
                {/* 3. Quick Actions */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Link to="/customer/book" style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 143, 0.05)', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', transition: 'transform 0.2s, borderColor 0.2s', cursor: 'pointer' }} className="hover-card">
                                <CalendarPlus size={28} color="var(--primary)" style={{ marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                                <h4 style={{ margin: 0, color: 'var(--text)' }}>Book Service</h4>
                            </div>
                        </Link>
                        <Link to="/queue" style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 143, 0.05)', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', transition: 'transform 0.2s, borderColor 0.2s', cursor: 'pointer' }} className="hover-card">
                                <List size={28} color="var(--primary)" style={{ marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                                <h4 style={{ margin: 0, color: 'var(--text)' }}>Live Queue</h4>
                            </div>
                        </Link>
                        <Link to="/customer/tokens" style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 143, 0.05)', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', transition: 'transform 0.2s, borderColor 0.2s', cursor: 'pointer' }} className="hover-card">
                                <Ticket size={28} color="var(--primary)" style={{ marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                                <h4 style={{ margin: 0, color: 'var(--text)' }}>My Tokens</h4>
                            </div>
                        </Link>
                        <Link to="/customer/reviews" style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 143, 0.05)', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', transition: 'transform 0.2s, borderColor 0.2s', cursor: 'pointer' }} className="hover-card">
                                <MessageSquare size={28} color="var(--primary)" style={{ marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                                <h4 style={{ margin: 0, color: 'var(--text)' }}>Feedback</h4>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 4. Recent Visits */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Recent Visits</h3>
                        <Link to="/customer/tokens" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>

                    {pastTokens.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pastTokens.map(token => (
                                <div key={token._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                            <CalendarPlus size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem 0' }}>{token.service?.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {format(new Date(token.date), 'MMM dd, yyyy')} • {token.staff?.name || 'Mercy Staff'}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`badge badge-${token.status === 'completed' ? 'success' : token.status === 'cancelled' ? 'danger' : 'warning'}`}>
                                            {token.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', width: 48, height: 48, background: 'var(--bg-secondary)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <History size={24} color="var(--text-secondary)" />
                            </div>
                            <p style={{ margin: 0 }}>No past visits found.</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--primary) !important;
                }
            `}} />
        </div>
    );
};

export default Home;
