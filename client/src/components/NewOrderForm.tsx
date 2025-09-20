import React from 'react';

export default function NewOrderForm() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Neuen Auftrag anlegen</h2>
      <form className="space-y-4">
        <div>
          <label htmlFor="completion" className="block text-gray-700 font-medium">Fertigstellung:</label>
          <input type="date" id="completion" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div>
          <label htmlFor="vin" className="block text-gray-700 font-medium">Fahrgestell-NR:</label>
          <input type="text" id="vin" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div>
          <label htmlFor="order-nr" className="block text-gray-700 font-medium">Auftrags-NR:</label>
          <input type="text" id="order-nr" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div>
          <label htmlFor="paint-nr" className="block text-gray-700 font-medium">Lack-NR:</label>
          <input type="text" id="paint-nr" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div>
          <label htmlFor="branch" className="block text-gray-700 font-medium">Filiale:</label>
          <select id="branch" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <option>Heufeld</option>
            {/* Weitere Filialen hier einfügen */}
          </select>
        </div>
        <div className="text-right">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700">
            Auftrag erstellen
          </button>
        </div>
      </form>
    </div>
  );
}
