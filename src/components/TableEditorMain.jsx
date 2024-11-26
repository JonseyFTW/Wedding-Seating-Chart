import React, { useState } from 'react';
import { Plus, Minus, ArrowLeft, Save, Heart, Sparkles, LogOut, Mail, Download, Grid, Brain } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FloorPlan } from './FloorPlan';
import { MobileFloorPlan } from './MobileFloorPlan';
import { generateUUID } from '../utils/uuid';
import { GuestEditor } from './GuestEditor';
import { SaveLayoutModal } from './SaveLayoutModal';
import { AISeatingPlanner } from './AISeatingPlanner';
import { useAuth } from '../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const tableTypes = [
  { type: '1-sided', label: '1 Sided', defaultSeats: 8 },
  { type: 'round', label: 'Round', defaultSeats: 8 },
  { type: '2-sided', label: '2 Sided', defaultSeats: 8 },
  { type: '4-sided', label: '4 Sided', defaultSeats: 10 },
];

export const TableEditor = ({ isMobileView, onBack }) => {
  const { currentEvent, addTable, setCurrentEvent } = useStore();
  const [showTableConfig, setShowTableConfig] = useState(!currentEvent?.tables?.length || !currentEvent?.isLoadedLayout);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const { currentUser, logout } = useAuth();
  const [tables, setTables] = useState({
    '1-sided': { count: 1, seats: 8 },
    round: { count: 6, seats: 8 },
    '2-sided': { count: 0, seats: 8 },
    '4-sided': { count: 0, seats: 10 },
  });

  const handleExport = async () => {
    const element = document.getElementById('floor-plan');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#FFF9F0',
        scale: 2,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        canvas.width,
        canvas.height
      );

      pdf.save(`${currentEvent?.name || 'seating-chart'}.pdf`);
    } catch (error) {
      console.error('Error exporting layout:', error);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Wedding Seating Chart - ${currentEvent?.name || 'Layout'}`);
    const body = encodeURIComponent(`Here's the seating chart for ${currentEvent?.name || 'the wedding'}.\n\nTotal Tables: ${currentEvent?.tables?.length || 0}\nTotal Seats: ${currentEvent?.tables?.reduce((acc, table) => acc + table.seats, 0) || 0}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const updateCount = (type, increment) => {
    setTables((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        count: Math.max(0, prev[type].count + (increment ? 1 : -1)),
      },
    }));
  };

  const updateSeats = (type, increment) => {
    setTables((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        seats: Math.max(1, prev[type].seats + (increment ? 1 : -1)),
      },
    }));
  };

  const handleAddTables = () => {
    const gridSize = isMobileView ? 120 : 160;
    const margin = 40;
    let currentX = margin;
    let currentY = margin;
    const maxWidth = window.innerWidth - margin * 2;
    const tablesPerRow = Math.floor(maxWidth / (gridSize + margin));

    Object.entries(tables).forEach(([type, config]) => {
      for (let i = 0; i < config.count; i++) {
        const table = {
          id: generateUUID(),
          type: type,
          seats: config.seats,
          position: { x: currentX, y: currentY },
          guests: [],
          rotation: 0,
        };

        addTable(table);

        currentX += gridSize + margin;
        if (currentX + gridSize > maxWidth) {
          currentX = margin;
          currentY += gridSize + margin;
        }
      }
    });

    setShowTableConfig(false);
  };

  const handleBack = () => {
    if (window.confirm('Going back will clear your current layout. Are you sure?')) {
      setCurrentEvent(null);
      onBack?.();
    }
  };

  if (showAIPlanner) {
    return <AISeatingPlanner onBack={() => setShowAIPlanner(false)} />;
  }

  if (!showTableConfig || currentEvent?.isLoadedLayout) {
    return (
      <>
        {/* Main Header */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#F4E1B2]/90 to-[#D3A6B8]/90 backdrop-blur-md z-30">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#D3A6B8]" />
                <h1 className="text-xl font-serif text-[#4A3B52]">Wedding Seating Chart</h1>
                <Sparkles className="w-4 h-4 text-[#E5C594]" />
              </div>
              
              {currentUser && (
                <div className="flex items-center gap-3">
                  <span className="text-[#4A3B52] text-sm font-serif">
                    Hi, {currentUser.displayName?.split(' ')[0] || 'there'}!
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white/80 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
                  >
                    <LogOut className="w-4 h-4 text-[#D3A6B8]" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Bar with Layout Name and Actions */}
        <div className="fixed top-[52px] left-0 right-0 bg-white/95 border-b border-[#D3A6B8]/20 z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between py-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4 text-[#D3A6B8]" />
                <span className="hidden md:inline">Back to Menu</span>
              </button>

              {currentEvent?.name && (
                <h2 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-serif text-[#4A3B52]">
                  {currentEvent.name}
                </h2>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAIPlanner(true)}
                  className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
                >
                  <Brain className="w-4 h-4 text-[#D3A6B8]" />
                  <span className="hidden md:inline">AI Planner</span>
                </button>
                {currentUser && (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
                  >
                    <Save className="w-4 h-4 text-[#D3A6B8]" />
                    <span className="hidden md:inline">Save</span>
                  </button>
                )}
                <button 
                  onClick={handleEmail}
                  className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
                >
                  <Mail className="w-4 h-4 text-[#D3A6B8]" />
                  <span className="hidden md:inline">Email</span>
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
                >
                  <Download className="w-4 h-4 text-[#D3A6B8]" />
                  <span className="hidden md:inline">Export</span>
                </button>
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
                >
                  <Grid className="w-4 h-4 text-[#D3A6B8]" />
                  <span className="hidden md:inline">Grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Adjust the floor plan container to account for both headers */}
        <div className="fixed inset-0 overflow-hidden" style={{ top: '104px' }}>
          {isMobileView ? <MobileFloorPlan showGrid={showGrid} /> : <FloorPlan showGrid={showGrid} />}
        </div>
        
        {showSaveModal && (
          <SaveLayoutModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            currentLayout={currentEvent}
          />
        )}
      </>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-serif text-[#646E78] mb-2 text-center">
        Design Your Layout
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6 text-center">
        Add tables to get started
      </p>

      <div className="space-y-4 md:space-y-6 bg-white p-6 rounded-lg border-2 border-[#F4E1B2] shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 text-sm font-medium text-[#646E78]">
          <span>Type</span>
          <span className="text-center">Tables</span>
          <span className="text-center">Guests</span>
        </div>

        {tableTypes.map(({ type, label }) => (
          <div
            key={type}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
          >
            <span className="text-sm md:text-base font-serif text-[#646E78]">
              {label}
            </span>

            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => updateCount(type, false)}
                className="p-1.5 md:p-2 hover:bg-[#F4E1B2]/20 rounded"
                type="button"
                aria-label={`Decrease number of ${label} tables`}
              >
                <Minus className="w-4 h-4 text-[#646E78]" />
              </button>
              <span className="w-6 md:w-8 text-center text-sm md:text-base text-[#646E78]">
                {tables[type].count}
              </span>
              <button
                onClick={() => updateCount(type, true)}
                className="p-1.5 md:p-2 hover:bg-[#F4E1B2]/20 rounded"
                type="button"
                aria-label={`Increase number of ${label} tables`}
              >
                <Plus className="w-4 h-4 text-[#646E78]" />
              </button>
            </div>

            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => updateSeats(type, false)}
                className="p-1.5 md:p-2 hover:bg-[#F4E1B2]/20 rounded"
                type="button"
                aria-label={`Decrease number of seats for ${label} tables`}
              >
                <Minus className="w-4 h-4 text-[#646E78]" />
              </button>
              <span className="w-6 md:w-8 text-center text-sm md:text-base text-[#646E78]">
                {tables[type].seats}
              </span>
              <button
                onClick={() => updateSeats(type, true)}
                className="p-1.5 md:p-2 hover:bg-[#F4E1B2]/20 rounded"
                type="button"
                aria-label={`Increase number of seats for ${label} tables`}
              >
                <Plus className="w-4 h-4 text-[#646E78]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 md:mt-8 pt-4 border-t border-[#F4E1B2]">
        <p className="text-xs md:text-sm text-gray-600 mb-4 text-center">
          {Object.values(tables).reduce(
            (acc, { count, seats }) => acc + count * seats,
            0
          )}{' '}
          total seats
        </p>
        <button
          onClick={handleAddTables}
          className="w-full bg-gradient-to-r from-[#F4E1B2] to-[#E5C594] text-[#646E78] py-3 rounded-full hover:opacity-90 transition-opacity text-sm md:text-base font-serif shadow-md"
          type="button"
        >
          Create Layout
        </button>
      </div>
    </div>
  );
};