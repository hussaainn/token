import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Scissors, ListOrdered,
    BarChart2, ScanLine, History, MessageSquare, CalendarCheck, LogOut
} from 'lucide-react';

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

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside style={{
            width: '220px', minHeight: '100vh', background: 'var(--surface)',
            borderRight: '1px solid var(--border)', padding: '1.5rem 0',
            position: 'fixed', top: 0, left: 0, zIndex: 100,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            <div>
                <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.1rem' }}>💅 Mercy Admin</h2>
                </div>
                <nav>
                    {links.map(link => (
                        <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1.5rem',
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            background: isActive ? 'rgba(244,63,143,0.08)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                            textDecoration: 'none', fontSize: '0.9rem',
                            fontWeight: isActive ? 600 : 400, transition: 'all 0.2s'
                        })}>
                            {link.icon} {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div style={{ padding: '1.5rem' }}>
                <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.75rem', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', background: 'transparent',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem'
                }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
