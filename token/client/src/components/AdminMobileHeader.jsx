import { useState } from 'react';
import { Menu, X, LayoutDashboard, Users, Scissors, ListOrdered, BarChart2, ScanLine, History, MessageSquare, CalendarCheck, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/queue', icon: <ListOrdered size={18} />, label: 'Queue Control' },
    { to: '/admin/today', icon: <CalendarCheck size={18} />, label: "Today's Services" },
    { to: '/admin/staff', icon: <Users size={18} />, label: 'Manage Staff' },
    { to: '/admin/services', icon: <Scissors size={18} />, label: 'Services' },
    { to: '/admin/history', icon: <History size={18} />, label: 'Customer History' },
    { to: '/admin/feedback', icon: <MessageSquare size={18} />, label: 'Feedback' },
    { to: '/admin/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
    { to: '/admin/check-in', icon: <ScanLine size={18} />, label: 'Check-In' },
];

const AdminMobileHeader = () => {
    const [open, setOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile top bar */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                padding: '0.75rem 1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
            }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem' }}>💅 Mercy Admin</h3>
                <button
                    onClick={() => setOpen(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text)' }}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Top padding so content doesn't hide behind header */}
            <div style={{ height: '56px' }} />

            {/* Drawer overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 1001
                    }}
                />
            )}

            {/* Slide-in drawer */}
            <div style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: '280px',
                background: 'var(--surface)',
                zIndex: 1002,
                transform: open ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto'
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>💅 Mercy Admin</h3>
                    <button
                        onClick={() => setOpen(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
                    >
                        <X size={22} />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '0.5rem 0' }}>
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setOpen(false)}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.85rem 1.5rem',
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(244,63,143,0.08)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                textDecoration: 'none', fontSize: '0.95rem',
                                fontWeight: isActive ? 600 : 400
                            })}
                        >
                            {link.icon} {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            width: '100%', padding: '0.75rem',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                            background: 'transparent', color: 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminMobileHeader;
