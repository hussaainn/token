import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    // 🔐 Auto redirect if already logged in
    useEffect(() => {
        if (user) {
            const dashboardMap = {
                admin: '/admin/dashboard',
                staff: '/staff/tokens',
                customer: '/customer/tokens',
            };
            navigate(dashboardMap[user.role] || '/', { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const res = await api.post('/auth/login', {
                email: formData.email.trim(),
                password: formData.password
            });

            const { user, token, refreshToken } = res.data;

            login(user, token, refreshToken);

            toast.success(`Welcome back, ${user.name}!`);

            if (from === '/') {
                const dashboardMap = {
                    admin: '/admin/dashboard',
                    staff: '/staff/tokens',
                    customer: '/customer/tokens',
                };
                navigate(dashboardMap[user.role] || '/', { replace: true });
            } else {
                navigate(from, { replace: true });
            }

        } catch (err) {
            console.error('Login failed:', err);
            const msg = err.response?.data?.message || err.message || 'Network error occurred. Please check your connection.';
            toast.error(msg);
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
                        <LogIn size={32} />
                    </div>
                    <h2>Login to TOQN</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Enter your credentials to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
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
                                name="email"
                                className="form-control"
                                placeholder="email@example.com"
                                style={{ paddingLeft: '40px' }}
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label" style={{ marginBottom: '0' }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                            <Lock size={18}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px' }}
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                minLength="6"
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
                            'Login'
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register"
                            style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            {/* ⚠ REMOVE THIS IN PRODUCTION */}
            <div
                className="card"
                style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(108,99,255,0.1)',
                    border: '1px dashed var(--primary)'
                }}
            >
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Test Credentials:
                </p>
                <ul style={{ fontSize: '0.8rem', listStyle: 'none', padding: 0 }}>
                    <li>
                        Admin: <code>admin@mercysalon.com / password123</code>
                    </li>
                    <li>
                        Customer: <code>ramesh@example.com / password123</code>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Login;