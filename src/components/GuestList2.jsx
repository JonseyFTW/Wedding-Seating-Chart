// src/components/GuestList.jsx
import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { RELATIONSHIP_TYPES } from '../utils/constants';

export const GuestList = ({ 
  guests, 
  onUpdateGuests,
  relationships,
  onAddRelationship,
  onRemoveRelationship
}) => {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);

  const handleGuestSelect = (guest) => {
    setSelectedGuest(guest);
    setShowRelationshipModal(true);
  };

  const handleAddRelationship = (targetGuest, relationshipType) => {
    onAddRelationship(selectedGuest.id, targetGuest.id, relationshipType);
  };

  const getRelationshipType = (guest1, guest2) => {
    const relationship = relationships.find(
      r => (r.source === guest1.id && r.target === guest2.id) ||
           (r.source === guest2.id && r.target === guest1.id)
    );
    return relationship?.type || RELATIONSHIP_TYPES.NONE.value;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
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
            {guests.map((guest) => (
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
                      onClick={() => handleGuestSelect(guest)}
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

      {showRelationshipModal && selectedGuest && (
        <RelationshipModal
          selectedGuest={selectedGuest}
          guests={guests.filter(g => g.id !== selectedGuest.id)}
          relationships={relationships}
          onAddRelationship={handleAddRelationship}
          onRemoveRelationship={onRemoveRelationship}
          onClose={() => {
            setSelectedGuest(null);
            setShowRelationshipModal(false);
          }}
          getRelationshipType={getRelationshipType}
        />
      )}
    </div>
  );
};

const RelationshipModal = ({
  selectedGuest,
  guests,
  relationships,
  onAddRelationship,
  onRemoveRelationship,
  onClose,
  getRelationshipType
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-serif text-[#4A3B52]">
            Manage Relationships for {selectedGuest.name}
          </h3>
          <button onClick={onClose} className="text-[#646E78] hover:text-[#4A3B52]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {guests.map(guest => (
            <div key={guest.id} className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-lg">
              <span className="text-[#4A3B52]">{guest.name}</span>
              <select
                value={getRelationshipType(selectedGuest, guest)}
                onChange={(e) => {
                  const type = e.target.value;
                  if (type === RELATIONSHIP_TYPES.NONE.value) {
                    onRemoveRelationship(selectedGuest.id, guest.id);
                  } else {
                    onAddRelationship(selectedGuest.id, guest.id, type);
                  }
                }}
                className="ml-4 rounded-md border-[#D3A6B8]/20 focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
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
};
