import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, Menu, X, User, Bell, Ticket } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar" style={{
            height: 'var(--nav-height)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>
                    <Ticket size={28} />
                    TOQN
                </Link>

                {/* Desktop Menu */}
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link to="/queue" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Live Queue</Link>

                    {isAuthenticated ? (
                        <>
                            {user.role === 'customer' && (
                                <>
                                    <Link to="/customer/book" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Book Service</Link>
                                    <Link to="/customer/tokens" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>My Tokens</Link>
                                </>
                            )}
                            {user.role === 'admin' && <Link to="/admin/dashboard" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Admin Panel</Link>}
                            {user.role === 'staff' && <Link to="/staff/tokens" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Staff Panel</Link>}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                                <button onClick={toggleTheme} className="btn-icon" style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                                <Link to="/notifications" style={{ color: 'var(--text-secondary)' }}><Bell size={20} /></Link>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <button onClick={handleLogout} className="btn-icon" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button onClick={toggleTheme} className="btn-icon" style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', marginRight: '0.5rem' }}>
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="show-mobile btn-icon" style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Drawer Placeholder - Simplify for now */}
        </nav>
    );
};

export default Navbar;
