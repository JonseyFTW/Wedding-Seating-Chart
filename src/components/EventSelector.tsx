import React from 'react';
import { useStore } from '../store/useStore';
import { Event } from '../types';
import { generateUUID } from '../utils/uuid';
import { Heart } from 'lucide-react';

const eventTypes = [
  'After hours',
  'We make it official',
  'Cocktails, eats & dancing',
  'After Party',
];

export const EventSelector: React.FC = () => {
  const { addEvent, setCurrentEvent } = useStore();

  const handleEventSelect = (eventName: string) => {
    const newEvent: Event = {
      id: generateUUID(),
      name: eventName,
      tables: [],
      furniture: []
    };
    addEvent(newEvent);
    setCurrentEvent(newEvent);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <Heart className="w-8 h-8 text-[#D3A6B8] mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-[#646E78] mb-2">
          Welcome to Your Wedding Seating Chart
        </h2>
        <p className="text-sm text-gray-600">
          Let's begin by selecting your event type
        </p>
      </div>
      <div className="space-y-3">
        {eventTypes.map((eventName) => (
          <button
            key={eventName}
            onClick={() => handleEventSelect(eventName)}
            className="w-full p-4 text-left border-2 border-[#F4E1B2] rounded-lg hover:bg-[#F4E1B2]/10 transition-colors font-serif text-[#646E78]"
          >
            {eventName}
          </button>
        ))}
      </div>
    </div>
  );
};