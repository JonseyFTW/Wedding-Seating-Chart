import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Table } from '../types';
import { FloorPlan } from './FloorPlan';
import { MobileFloorPlan } from './MobileFloorPlan';
import { generateUUID } from '../utils/uuid';

const tableTypes = [
  { type: '1-sided', label: '1 sided', defaultSeats: 8 },
  { type: 'round', label: 'Round', defaultSeats: 8 },
  { type: '2-sided', label: '2 sided', defaultSeats: 8 },
  { type: '4-sided', label: '4 sided', defaultSeats: 10 },
] as const;

interface TableEditorProps {
  isMobileView: boolean;
}

export const TableEditor: React.FC<TableEditorProps> = ({ isMobileView }) => {
  const { currentEvent, addTable } = useStore();
  const [showTableConfig, setShowTableConfig] = React.useState(!currentEvent?.tables.length);
  const [tables, setTables] = React.useState<
    Record<string, { count: number; seats: number }>
  >({
    '1-sided': { count: 1, seats: 8 },
    round: { count: 6, seats: 8 },
    '2-sided': { count: 0, seats: 8 },
    '4-sided': { count: 0, seats: 10 },
  });

  const updateCount = (type: string, increment: boolean) => {
    setTables((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        count: Math.max(0, prev[type].count + (increment ? 1 : -1)),
      },
    }));
  };

  const updateSeats = (type: string, increment: boolean) => {
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
    const maxWidth = window.innerWidth - (margin * 2);
    const tablesPerRow = Math.floor(maxWidth / (gridSize + margin));

    Object.entries(tables).forEach(([type, config]) => {
      for (let i = 0; i < config.count; i++) {
        const table: Table = {
          id: generateUUID(),
          type: type as Table['type'],
          seats: config.seats,
          position: { x: currentX, y: currentY },
          guests: [],
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

  if (!showTableConfig) {
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ top: '64px' }}>
        {isMobileView ? <MobileFloorPlan /> : <FloorPlan />}
      </div>
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
        {tableTypes.map(({ type, label }) => (
          <div key={type} className="flex items-center justify-between">
            <span className="w-20 md:w-24 text-sm md:text-base font-serif text-[#646E78]">
              {label}
            </span>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => updateCount(type, false)}
                  className="p-1.5 md:p-2 hover:bg-[#F4E1B2]/20 rounded"
                  type="button"
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
                >
                  <Plus className="w-4 h-4 text-[#646E78]" />
                </button>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => updateSeats(type, false)}
                  className="p-1.5 md:p-2 hover:bg-[#F4E1B2]/20 rounded"
                  type="button"
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
                >
                  <Plus className="w-4 h-4 text-[#646E78]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 md:mt-8 pt-4 border-t border-[#F4E1B2]">
        <p className="text-xs md:text-sm text-gray-600 mb-4 text-center">
          {Object.values(tables).reduce((acc, { count, seats }) => acc + count * seats, 0)} total seats
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