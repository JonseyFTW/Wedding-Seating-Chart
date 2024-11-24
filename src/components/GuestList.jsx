import React from 'react';
import { X } from 'lucide-react';

export const GuestList = ({ guests, onUpdateGuests }) => {
  const removeGuest = (guestId) => {
    onUpdateGuests(guests.filter(g => g.id !== guestId));
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
                  <button
                    onClick={() => removeGuest(guest.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};