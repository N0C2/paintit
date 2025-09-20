import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white p-4 space-y-4">
      <nav className="space-y-2">
        <a href="#" className="block p-2 rounded-md hover:bg-gray-700">Aufträge</a>
        <a href="#" className="block p-2 rounded-md hover:bg-gray-700">Neuen Auftrag</a>
        <a href="#" className="block p-2 rounded-md hover:bg-gray-700">Abg. Aufträge</a>
      </nav>
    </div>
  );
}
