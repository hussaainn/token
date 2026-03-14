import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Smartphone } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, token, onComplete }) => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState('');

    console.log('=== PAYMENT MODAL DEBUG ===');
    console.log('Full token object:', JSON.stringify(token, null, 2));
    console.log('token.service:', token?.service);
    console.log('token.servicePrice:', token?.servicePrice);
    console.log('token.price:', token?.price);
    console.log('token.addOnServices:', token?.addOnServices);

    useEffect(() => {
        if (isOpen && token) {
            setPaymentMethod('cash');
            setNote('');
        }
    }, [isOpen, token]);

    // Handle both populated object and plain number
    const baseAmount =
        token?.service?.price ||      // populated service object
        token?.servicePrice ||         // direct field
        token?.price ||                // fallback field
        token?.basePrice ||            // another fallback
        0;

    const addOnList = token?.addOnServices || [];
    const addonsTotal = addOnList.reduce((sum, s) => sum + (s?.price || 0), 0);
    const totalAmount = baseAmount + addonsTotal;

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onComplete(token._id, {
                status: 'completed',
                amount: totalAmount,
                paymentMethod,
                notes: note
            });
            onClose();
        } catch (error) {
            console.error('Payment submission failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal-content fade-in" style={{
                background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px',
                position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text)' }}>Complete Service</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Record payment for {token.customer?.name || token.customerName || 'Walk-in Customer'}'s visit
                </p>

                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>{token?.service?.name || token?.serviceName || 'Base Service'}</span>
                        <span>₹{baseAmount}</span>
                    </div>
                    {addOnList.map((addon, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <span>+ {addon.service?.name || 'Add-on'}</span>
                            <span>₹{addon.price || addon.service?.price || 0}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                        <span>Total to Collect</span>
                        <span>₹{totalAmount}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Optional Note</label>
                        <textarea
                            className="form-control"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Any remarks about this payment..."
                            rows="2"
                            style={{ resize: 'none', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Payment Method</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    padding: '1rem 0.5rem', borderRadius: '0.5rem', border: `1px solid ${paymentMethod === 'cash' ? 'var(--primary)' : 'var(--border)'}`,
                                    background: paymentMethod === 'cash' ? 'rgba(244, 63, 143, 0.05)' : 'transparent',
                                    color: paymentMethod === 'cash' ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <DollarSign size={20} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cash</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    padding: '1rem 0.5rem', borderRadius: '0.5rem', border: `1px solid ${paymentMethod === 'card' ? 'var(--primary)' : 'var(--border)'}`,
                                    background: paymentMethod === 'card' ? 'rgba(244, 63, 143, 0.05)' : 'transparent',
                                    color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <CreditCard size={20} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('upi')}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    padding: '1rem 0.5rem', borderRadius: '0.5rem', border: `1px solid ${paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border)'}`,
                                    background: paymentMethod === 'upi' ? 'rgba(244, 63, 143, 0.05)' : 'transparent',
                                    color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Smartphone size={20} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>UPI</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Processing...' : `Confirm Payment — ₹${totalAmount}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
