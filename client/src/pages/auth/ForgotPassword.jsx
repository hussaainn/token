import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setIsSuccess(true);
            toast.success('Reset link sent if email exists');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '400px', margin: '3rem auto' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--primary)',
                        color: '#fff',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <Mail size={32} />
                    </div>
                    <h2>Forgot Password</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {isSuccess ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(34,197,94,0.1)',
                            border: '1px dashed var(--success)',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.5rem',
                            color: 'var(--success)',
                            fontWeight: 600
                        }}>
                            If this email exists in our system, you will receive a reset link shortly. Please check your inbox and spam folder.
                        </div>
                        <Link to="/login" className="btn btn-secondary btn-full">
                            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }}
                                />
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="email@example.com"
                                    style={{ paddingLeft: '40px' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <Link to="/login"
                                style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <ArrowLeft size={14} /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
