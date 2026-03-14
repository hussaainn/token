import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="container page">
                <Outlet />
            </main>
            <MobileNav />
            <Toaster position="top-right" />
        </div>
    );
};

export default Layout;
