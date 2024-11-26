import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { generateUUID } from '../utils/uuid';
import { Heart, Save, FolderOpen } from 'lucide-react';
import { SaveLayoutModal } from './SaveLayoutModal';
import { SavedLayouts } from './SavedLayouts';
import { useAuth } from '../contexts/AuthContext';

const eventTypes = [
  'Reception',
  'Quinceañera/Sweet 16',
  'Rehearsal Dinner',
  'Corporate Banquet',
  'Other'
];

export const EventSelector = () => {
  const { addEvent, setCurrentEvent, currentEvent } = useStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedLayouts, setShowSavedLayouts] = useState(false);
  const { currentUser } = useAuth();

  const handleEventSelect = (eventName) => {
    const newEvent = {
      id: generateUUID(),
      name: eventName,
      tables: [],
      furniture: []
    };
    addEvent(newEvent);
    setCurrentEvent(newEvent);
  };

  if (showSavedLayouts) {
    return (
      <SavedLayouts
        onBack={() => setShowSavedLayouts(false)}
        onSelectLayout={() => setShowSavedLayouts(false)}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <Heart className="w-8 h-8 text-[#D3A6B8] mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-[#646E78] mb-2">
          Welcome to Your Wedding Seating Chart
        </h2>
        <p className="text-sm text-[#646E78]">
          Let's begin by selecting your event type
        </p>
      </div>

      {currentUser && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowSavedLayouts(true)}
            className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-[#F4E1B2] rounded-lg hover:bg-[#F4E1B2]/10 transition-colors font-serif text-[#646E78]"
          >
            <FolderOpen className="w-5 h-5 text-[#D3A6B8]" />
            Open Saved Layout
          </button>
          {currentEvent && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-[#F4E1B2] rounded-lg hover:bg-[#F4E1B2]/10 transition-colors font-serif text-[#646E78]"
            >
              <Save className="w-5 h-5 text-[#D3A6B8]" />
              Save Current Layout
            </button>
          )}
        </div>
      )}

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

      {currentEvent && (
        <SaveLayoutModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          currentLayout={currentEvent}
        />
      )}
    </div>
  );
};