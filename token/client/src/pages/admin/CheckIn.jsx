import React, { useState } from 'react';
import QRScanner from '../../components/QRScanner';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Scan, User, CheckCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckIn = () => {
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleScanSuccess = async (decodedText) => {
        if (loading) return;

        try {
            setLoading(true);
            setScanning(false);

            // Expected format: JSON or raw token string. 
            // In our system, QR data is JSON: { tokenNumber, qrToken, salon }
            let qrToken;
            try {
                const data = JSON.parse(decodedText);
                qrToken = data.qrToken;
            } catch (e) {
                qrToken = decodedText; // Fallback to raw string
            }

            const res = await api.post('/tokens/checkin', { qrToken });
            setResult(res.data.token);
            toast.success('Check-in successful!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid QR code or check-in failed');
            setScanning(true);
        } finally {
            setLoading(false);
        }
    };

    const handleScanError = (err) => {
        // console.warn(err); // Silent error for continuous scanning
    };

    const resetScanner = () => {
        setResult(null);
        setScanning(true);
    };

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Customer Check-in</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Scan QR code from customer's digital token</p>
                </div>
                <Link to="/admin/queue" className="btn btn-secondary btn-sm">
                    <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Back to Queue
                </Link>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {scanning ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <Scan size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h3 style={{ marginBottom: '1rem' }}>Scan QR Code</h3>
                        <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Position the QR code within the reader area
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        {loading ? (
                            <div className="spinner" style={{ margin: '2rem auto' }}></div>
                        ) : result ? (
                            <div className="fade-in">
                                {result.customer?.avatar ? (
                                    <img
                                        src={result.customer.avatar}
                                        alt={result.customer.name}
                                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '4px solid var(--success)' }}
                                    />
                                ) : (
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <User size={40} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                )}
                                <h2 style={{ marginBottom: '0.5rem' }}>Check-in Successful!</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Customer is ready to be served</p>

                                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius)', margin: '1.5rem 0', textAlign: 'left', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Token Number</span>
                                        <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{result.tokenNumber}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customer</span>
                                        <span style={{ fontWeight: 600 }}>{result.customer?.name || 'Customer'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Service</span>
                                        <span style={{ fontWeight: 600 }}>{result.service?.name || 'Service'}</span>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={resetScanner} style={{ width: '100%' }}>
                                    Scan Next Customer
                                </button>
                            </div>
                        ) : (
                            <div>
                                <AlertCircle size={64} style={{ color: 'var(--danger)', marginBottom: '1.5rem' }} />
                                <h2>Something went wrong</h2>
                                <button className="btn btn-primary" onClick={resetScanner} style={{ marginTop: '1.5rem' }}>
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Check-ins */}
            <div style={{ maxWidth: '600px', margin: '2rem auto 0' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} /> Recent Check-ins
                </h3>
                <div className="card" style={{ padding: '0.5rem' }}>
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Customer {i + 1}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Service Name • T-1234{i}</div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{i * 5 + 2}m ago</div>
                        </div>
                    ))}
                    <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                        View Full History
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
