import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../App.css';

interface LayoutProps {
    onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
    return (
        <div className="layout-container">
            <aside className="sidebar">
                <h1>Paint.IT</h1>
                <nav>
                    <ul>
                        <li><NavLink to="/">Neuer Auftrag</NavLink></li>
                        <li><NavLink to="/orders">Auftragsliste</NavLink></li>
                    </ul>
                </nav>
                <button onClick={onLogout} className="secondary-button logout-button">
                    Logout
                </button>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

