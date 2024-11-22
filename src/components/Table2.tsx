// Table.tsx

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Table as TableType } from '../types';
import {
  Users,
  Edit2,
  RotateCcw,
  RotateCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { GuestEditor } from './GuestEditor';
import { useStore } from '../store/useStore';

interface TableProps {
  table: TableType;
  tableNumber: number;
  showNames: boolean;
  rotation: number;
}

export const Table: React.FC<TableProps> = ({
  table,
  tableNumber,
  showNames,
  rotation,
}) => {
  const { updateTable } = useStore();
  const [showGuestEditor, setShowGuestEditor] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [localRotation, setLocalRotation] = React.useState(
    table.rotation || 0
  );

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
    data: table,
  });

  // Apply the transform from dragging to the draggable element
  const draggableStyle: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'none',
    zIndex: 1000, // Ensure the table is on top during drag
  };

  // Helper function to get table dimensions based on type
  const getTableDimensions = () => {
    switch (table.type) {
      case 'round':
        return { width: 128, height: 128, borderRadius: '50%' }; // Correct the borderRadius for circle
      case '1-sided':
        return { width: 192, height: 96, borderRadius: '0.5rem' }; // 'w-48 h-24 rounded-lg'
      case '2-sided':
        return { width: 192, height: 128, borderRadius: '0.5rem' }; // 'w-48 h-32 rounded-lg'
      case '4-sided':
        return { width: 128, height: 128, borderRadius: '0.5rem' }; // 'w-32 h-32 rounded-lg'
      default:
        return { width: 128, height: 128, borderRadius: '0.5rem' };
    }
  };

  const tableDimensions = getTableDimensions();

  // Apply position and rotation to the outer container
  const style: React.CSSProperties = {
    position: 'absolute',
    touchAction: 'none',
    width: tableDimensions.width,
    height: tableDimensions.height,
    borderRadius: table.type === 'round' ? '50%' : tableDimensions.borderRadius, // Explicitly set borderRadius for round tables
    left: `${table.position.x}px`,
    top: `${table.position.y}px`,
    transform: `rotate(${localRotation + rotation}deg)`
  };

  const handleRotate = React.useCallback(
    (
      direction: 'clockwise' | 'counterclockwise',
      e: React.MouseEvent
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const newRotation =
        localRotation + (direction === 'clockwise' ? 90 : -90);
      setLocalRotation(newRotation);
      updateTable(table.id, { rotation: newRotation });
    },
    [localRotation, table.id, updateTable]
  );

  const handleEditClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowGuestEditor(true);
    setShowTooltip(false);
  }, []);

  const toggleLocalNames = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Toggle guest names visibility if necessary
    },
    []
  );

  const renderGuestNames = () => {
    if (!showNames) return null;

    // Calculate table dimensions in pixels based on Tailwind classes
    let tableDiameter = 128; // Default diameter for 'w-32' (32 * 4px)
    if (table.type === '1-sided' || table.type === '2-sided') {
      tableDiameter = 192; // For 'w-48' tables (48 * 4px)
    }
    const tableRadius = tableDiameter / 2;

    // Set larger padding distance for labels outside the table edge
    const labelPadding = 50; // Increased padding to prevent overlapping
    const radius = tableRadius + labelPadding;

    const filledSeats = table.guests.filter((g) => g.name);
    const totalSeats = filledSeats.length;

    return filledSeats.map((guest, index) => {
      // Calculate angle for each label
      const baseAngle = (index / totalSeats) * 360 - 90; // Start from top (-90 degrees)
      const adjustedAngle = baseAngle + localRotation + rotation;
      const radian = (adjustedAngle * Math.PI) / 180;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      // Rotate text along radial lines
      let textRotation = adjustedAngle;

      // Flip text if upside down to keep it readable
      if (textRotation > 90 && textRotation <= 270) {
        textRotation += 180;
      }

      return (
        <div
          key={guest.id}
          className="absolute"
          style={{
            // Position labels just outside the table edge
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
            transformOrigin: 'center',
            pointerEvents: 'none', // Prevent interference with other interactions
          }}
        >
          <div className="bg-white/95 px-2 py-1 rounded-full text-xs shadow-sm border border-gray-200 whitespace-nowrap z-20">
            {guest.name}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="relative group" style={{ ...style, zIndex: 100 }}>
        {/* Controls positioned at the top */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-md border border-gray-100">
            <button
              onClick={(e) => handleRotate('counterclockwise', e)}
              className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
              type="button"
              title="Rotate counterclockwise"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleRotate('clockwise', e)}
              className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
              type="button"
              title="Rotate clockwise"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleEditClick}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200 relative"
              type="button"
            >
              <Edit2 className="w-4 h-4" />
              {showTooltip && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-40">
                  Edit guests
                </div>
              )}
            </button>
            <button
              onClick={toggleLocalNames}
              className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
              type="button"
              title={showNames ? 'Hide guest names' : 'Show guest names'}
            >
              {showNames ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Table container */}
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={draggableStyle}
          className={`bg-white border-2 border-gray-200 shadow-lg select-none w-full h-full flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing ${table.type === 'round' ? 'rounded-full' : ''}`}
        >
          <span className="font-semibold text-center text-gray-900">
            Table {tableNumber}
          </span>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>
              {table.guests.filter((g) => g.name).length}/{table.seats}
            </span>
          </div>

          {/* Guest names around the table */}
          {renderGuestNames()}
        </div>
      </div>

      {showGuestEditor && (
        <GuestEditor
          table={table}
          tableNumber={tableNumber}
          onClose={() => setShowGuestEditor(false)}
        />
      )}
    </>
  );
};
