import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../App.css';

interface LayoutProps {
    onLogout: () => void;
    role?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, role }) => {
    return (
        <div className="layout-container">
            <aside className="sidebar">
                <h1>Paint.IT</h1>
                <nav>
                    <ul>
                        <li><NavLink to="/orders/new" end>Neuer Auftrag</NavLink></li>
                        <li><NavLink to="/orders" end>Auftragsliste</NavLink></li>
                        <li><NavLink to="/orders/completed" end>Abgeschlossene Aufträge</NavLink></li>
                        {role === 'admin' && <>
                            <li><NavLink to="/users/new">Benutzer anlegen</NavLink></li>
                            <li><NavLink to="/users/manage">Benutzer verwalten</NavLink></li>
                        </>}
                    </ul>
                </nav>
                <button onClick={onLogout} className="secondary-button logout-button">Logout</button>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};
export default Layout;
