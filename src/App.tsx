import React from 'react';
import { useStore } from './store/useStore';
import { EventSelector } from './components/EventSelector';
import { TableEditor } from './components/TableEditor';
import { RotateCcw, Heart } from 'lucide-react';

export default function App() {
  const { currentEvent, setCurrentEvent } = useStore();
  const [isMobileView, setIsMobileView] = React.useState(window.innerWidth < 768);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? This will clear all data.')) {
      localStorage.clear();
      setCurrentEvent(null);
      window.location.reload();
    }
  };

  const toggleView = () => {
    setIsMobileView(!isMobileView);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#F4E1B2] to-[#E5C594] shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#D3A6B8]" />
              <h1 className="text-xl md:text-2xl font-serif text-[#646E78] tracking-wide">
                {currentEvent ? currentEvent.name : 'Wedding Seating Chart'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#646E78] hover:bg-[#E5C594]/50 rounded-lg transition-colors"
                title="Reset Application"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="pt-16">
        {!currentEvent ? (
          <EventSelector />
        ) : (
          <TableEditor isMobileView={isMobileView} />
        )}
      </main>
    </div>
  );
}