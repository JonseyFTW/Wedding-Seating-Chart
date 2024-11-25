// src/components/GuestList.jsx
import React, { useState, useMemo } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { RELATIONSHIP_TYPES } from '../utils/constants';

// Helper function to get last name
const getLastName = (fullName) => {
  const nameParts = fullName.trim().split(' ');
  return nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
};

export const GuestList = ({ 
  guests, 
  onUpdateGuests, 
  relationships,
  onAddRelationship,
  onRemoveRelationship,
  blacklist,
  onAddToBlacklist,
  onRemoveFromBlacklist 
}) => {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGuestClick = (guest) => {
    setSelectedGuest(guest);
  };

  const handleRelationshipChange = (targetGuestId, type) => {
    if (!selectedGuest || selectedGuest.id === targetGuestId) return;

    // Remove existing relationship if any
    onRemoveRelationship?.(selectedGuest.id, targetGuestId);

    // Add new relationship if not "No Relationship"
    if (type !== RELATIONSHIP_TYPES.NONE.value) {
      onAddRelationship(selectedGuest.id, targetGuestId, type);
    }
  };

  const getRelationshipType = (guest1Id, guest2Id) => {
    const relationship = relationships?.find(
      rel => (rel.source === guest1Id && rel.target === guest2Id) ||
            (rel.source === guest2Id && rel.target === guest1Id)
    );
    return relationship?.type || RELATIONSHIP_TYPES.NONE.value;
  };

  const filteredGuests = useMemo(() => {
    return guests
      .filter(guest => 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));
  }, [guests, searchTerm]);

  if (selectedGuest) {
    const otherGuests = guests
      .filter(g => g.id !== selectedGuest.id)
      .sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));

    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-[#F4E1B2] flex justify-between items-center">
          <h3 className="text-lg font-serif text-[#4A3B52]">
            Manage Relationships for {selectedGuest.name}
          </h3>
          <button
            onClick={() => setSelectedGuest(null)}
            className="text-[#4A3B52] hover:text-[#646E78]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border-[#D3A6B8]/20 focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
            />
            <Search className="w-4 h-4 text-[#D3A6B8] absolute left-3 top-3" />
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {otherGuests
              .filter(guest => 
                guest.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(guest => (
                <div key={guest.id} className="flex items-center justify-between">
                  <span className="text-[#4A3B52]">{guest.name}</span>
                  <select
                    value={getRelationshipType(selectedGuest.id, guest.id)}
                    onChange={(e) => handleRelationshipChange(guest.id, e.target.value)}
                    className="rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
                  >
                    {Object.values(RELATIONSHIP_TYPES).map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 bg-[#FDF8F0] border-b border-[#F4E1B2]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border-[#D3A6B8]/20 focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
          />
          <Search className="w-4 h-4 text-[#D3A6B8] absolute left-3 top-3" />
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-[#F4E1B2]">
          <thead className="bg-[#FDF8F0]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#4A3B52] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#4A3B52] uppercase tracking-wider">
                Dietary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#4A3B52] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#F4E1B2]">
            {filteredGuests.map((guest) => (
              <tr key={guest.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A3B52]">
                  {guest.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#646E78]">
                  {guest.dietaryRestrictions || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGuestClick(guest)}
                      className="text-[#D3A6B8] hover:text-[#C295A7]"
                      title="Manage Relationships"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateGuests(guests.filter(g => g.id !== guest.id))}
                      className="text-red-500 hover:text-red-700"
                      title="Remove Guest"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
