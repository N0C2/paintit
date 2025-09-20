import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  user: string;
  branch: string;
}

export default function Layout({ children, user, branch }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white p-4 shadow-md">
          <h1 className="text-xl font-bold text-gray-800">Paint.IT</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Filiale: {branch}</span>
            <span className="text-gray-600">Benutzer: {user}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
