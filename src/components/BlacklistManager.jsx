// src/components/BlacklistManager.jsx
import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

// Helper function to get last name
const getLastName = (fullName) => {
  const nameParts = fullName.trim().split(' ');
  return nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
};

export const BlacklistManager = ({ guests, blacklist, onAddToBlacklist, onRemoveFromBlacklist }) => {
  const [guest1, setGuest1] = useState('');
  const [guest2, setGuest2] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedGuests = useMemo(() => {
    return [...guests].sort((a, b) => 
      getLastName(a.name).localeCompare(getLastName(b.name))
    );
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return sortedGuests.filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedGuests, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guest1 && guest2 && guest1 !== guest2) {
      onAddToBlacklist(guest1, guest2);
      setGuest1('');
      setGuest2('');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-[#FDF8F0]">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border-[#D3A6B8]/20 focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20 mb-4"
            />
            <Search className="w-4 h-4 text-[#D3A6B8] absolute left-3 top-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A3B52] mb-1">
                Guest 1
              </label>
              <select
                value={guest1}
                onChange={(e) => setGuest1(e.target.value)}
                className="w-full rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
              >
                <option value="">Select guest...</option>
                {filteredGuests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A3B52] mb-1">
                Guest 2
              </label>
              <select
                value={guest2}
                onChange={(e) => setGuest2(e.target.value)}
                className="w-full rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
              >
                <option value="">Select guest...</option>
                {filteredGuests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#D3A6B8] text-white py-2 px-4 rounded-md hover:bg-[#C295A7] transition-colors"
        >
          Add Restriction
        </button>
      </form>

      <div className="space-y-2">
        {blacklist.map((restriction, index) => {
          const guest1Data = guests.find(g => g.id === restriction.source);
          const guest2Data = guests.find(g => g.id === restriction.target);
          
          return (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-2 rounded-md"
            >
              <span className="text-sm text-[#4A3B52]">
                {guest1Data?.name} ↔ {guest2Data?.name}
              </span>
              <button
                onClick={() => onRemoveFromBlacklist(restriction.source, restriction.target)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
