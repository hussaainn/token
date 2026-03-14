import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Ticket, Star, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
    { to: '/', icon: <Home size={22} />, label: 'Home', exact: true },
    { to: '/customer/book', icon: <Calendar size={22} />, label: 'Book' },
    { to: '/customer/tokens', icon: <Ticket size={22} />, label: 'My Tokens' },
    { to: '/customer/loyalty', icon: <Star size={22} />, label: 'Loyalty' },
    { to: '/notifications', icon: <Bell size={22} />, label: 'Alerts' },
];

const MobileNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Only show for customers
    if (!user || user.role !== 'customer') return null;

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingTop: '0.5rem',
            paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
            zIndex: 999,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
        }}>
            {tabs.map(tab => {
                const isActive = tab.exact
                    ? location.pathname === tab.to
                    : location.pathname.startsWith(tab.to);

                return (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px',
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            textDecoration: 'none',
                            fontSize: '0.65rem',
                            fontWeight: isActive ? 700 : 400,
                            minWidth: '52px',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            background: isActive ? 'rgba(244,63,143,0.08)' : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default MobileNav;
