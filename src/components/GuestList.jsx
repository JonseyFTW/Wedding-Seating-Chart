// src/components/GuestList.jsx
import React, { useState, useMemo } from 'react';
import { X, UserPlus, Users, Info } from 'lucide-react';
import { RELATIONSHIP_TYPES } from '../utils/constants';

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
  const [showTooltip, setShowTooltip] = useState(null);

  // Memoized relationships and blacklist for each guest
  const guestRelationships = useMemo(() => {
    const relationshipMap = {};
    guests.forEach(guest => {
      relationshipMap[guest.id] = {
        relationships: relationships.filter(rel => 
          rel.source === guest.id || rel.target === guest.id
        ),
        blacklisted: blacklist.filter(rel =>
          rel.source === guest.id || rel.target === guest.id
        )
      };
    });
    return relationshipMap;
  }, [guests, relationships, blacklist]);

  // Function to get a summary of relationships for a guest
  const getRelationshipSummary = (guestId) => {
    const guestRels = guestRelationships[guestId];
    if (!guestRels) return null;

    const relationshipCounts = {};
    guestRels.relationships.forEach(rel => {
      const type = rel.type || RELATIONSHIP_TYPES.FRIEND.value;
      relationshipCounts[type] = (relationshipCounts[type] || 0) + 1;
    });

    return (
      <div className="text-xs p-2 bg-white rounded-lg shadow-lg border border-[#D3A6B8]/20 min-w-[200px]">
        <h4 className="font-semibold mb-2 text-[#4A3B52]">Relationships:</h4>
        {Object.entries(relationshipCounts).map(([type, count]) => (
          <div key={type} className="flex justify-between text-[#646E78]">
            <span>{RELATIONSHIP_TYPES[type]?.label || type}:</span>
            <span>{count}</span>
          </div>
        ))}
        {guestRels.blacklisted.length > 0 && (
          <div className="mt-2 text-red-500">
            Cannot sit with: {guestRels.blacklisted.length} guest{guestRels.blacklisted.length !== 1 ? 's' : ''}
          </div>
        )}
        {Object.keys(relationshipCounts).length === 0 && guestRels.blacklisted.length === 0 && (
          <div className="text-[#646E78]">No relationships set</div>
        )}
      </div>
    );
  };

  // Function to get the relationship type between two guests
  const getRelationshipType = (guest1Id, guest2Id) => {
    const rel = relationships.find(rel => 
      (rel.source === guest1Id && rel.target === guest2Id) ||
      (rel.source === guest2Id && rel.target === guest1Id)
    );
    return rel ? rel.type : RELATIONSHIP_TYPES.NONE.value;
  };

  // Handler for clicking on a guest to manage relationships
  const handleGuestClick = (guest) => {
    setSelectedGuest(guest);
  };

  // Handler for changing a relationship type
  const handleRelationshipChange = (targetGuestId, type) => {
    if (!selectedGuest || selectedGuest.id === targetGuestId) return;

    // Remove existing relationship if any
    onRemoveRelationship(selectedGuest.id, targetGuestId);

    // Add new relationship if not "No Relationship"
    if (type !== RELATIONSHIP_TYPES.NONE.value) {
      onAddRelationship(selectedGuest.id, targetGuestId, type);
    }
  };

  // Filter and sort guests based on search term and last name
  const filteredGuests = useMemo(() => {
    return guests
      .filter(guest => 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by last name
        const lastNameA = a.name.split(' ').pop();
        const lastNameB = b.name.split(' ').pop();
        return lastNameA.localeCompare(lastNameB);
      });
  }, [guests, searchTerm]);

  // If a guest is selected, show the relationship management UI
  if (selectedGuest) {
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
        <div className="p-4 space-y-3">
          {filteredGuests
            .filter(g => g.id !== selectedGuest.id)
            .map(guest => (
              <div key={guest.id} className="flex items-center justify-between">
                <span className="text-[#4A3B52]">{guest.name}</span>
                <select
                  value={getRelationshipType(selectedGuest.id, guest.id)}
                  onChange={(e) => handleRelationshipChange(guest.id, e.target.value)}
                  className="rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20 text-xs" // Updated class
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
    );
  }

  // Main guest list table
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 bg-[#FDF8F0] border-b border-[#F4E1B2]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border-[#D3A6B8]/20 focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20 text-xs" // Updated class
          />
          <Users className="w-4 h-4 text-[#D3A6B8] absolute left-3 top-3" />
        </div>
      </div>

      {/* Guest List Table */}
      <div className="max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-[#F4E1B2]">
          <thead className="bg-[#FDF8F0]">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#4A3B52] uppercase tracking-wider w-1/3">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#4A3B52] uppercase tracking-wider w-1/4">
                Dietary
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#4A3B52] uppercase tracking-wider w-1/4">
                Relationships
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#4A3B52] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#F4E1B2]">
            {filteredGuests.map((guest) => {
              const guestRels = guestRelationships[guest.id];
              const relationshipCount = guestRels?.relationships.length || 0;
              const blacklistCount = guestRels?.blacklisted.length || 0;

              return (
                <tr key={guest.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-[#4A3B52]">
                    {guest.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-[#646E78]">
                    {guest.dietaryRestrictions || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="relative"
                        onMouseEnter={() => setShowTooltip(guest.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <Info className={`w-4 h-4 ${relationshipCount > 0 ? 'text-[#D3A6B8]' : 'text-[#646E78]'}`} />
                        {showTooltip === guest.id && (
                          <div className="absolute z-50 left-6 top-0">
                            {getRelationshipSummary(guest.id)}
                          </div>
                        )}
                      </div>
                      <span className={relationshipCount > 0 ? 'text-[#D3A6B8] text-xs' : 'text-[#646E78] text-xs'}>
                        {relationshipCount} connection{relationshipCount !== 1 ? 's' : ''}
                      </span>
                      {blacklistCount > 0 && (
                        <span className="text-red-500 text-xs">
                          ({blacklistCount} restriction{blacklistCount !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
