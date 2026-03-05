import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="fade-in">
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h1 style={{ marginBottom: '1rem' }}>Smart Queue Management for <span style={{ color: 'var(--primary)' }}>Mercy Salon</span></h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Generate your token online, track your position in real-time, and get notified when it's your turn.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <a href="/customer/book" className="btn btn-primary btn-lg">Book Now</a>
                    <a href="/queue" className="btn btn-secondary btn-lg">View Live Queue</a>
                </div>
            </div>

            <div className="grid-3" style={{ marginTop: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '0.75rem' }}>AI Predictions</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Get accurate waiting time estimates based on real-time traffic and staff availability.</p>
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '0.75rem' }}>Loyalty Rewards</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Earn 1 point for every ₹100 spent and redeem them for exciting discounts.</p>
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '0.75rem' }}>Live Tracking</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Share your location to let us know you're on your way and get checked in automatically.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
