import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Table as TableType } from '../types';
import { Users, Edit2, RotateCcw, RotateCw, Eye, EyeOff } from 'lucide-react';
import { GuestEditor } from './GuestEditor';
import { useStore } from '../store/useStore';

interface TableProps {
  table: TableType;
  tableNumber: number;
}

export const Table: React.FC<TableProps> = React.memo(({ table, tableNumber }) => {
  const { updateTable } = useStore();
  const [showGuestEditor, setShowGuestEditor] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [rotation, setRotation] = React.useState(table.rotation || 0);
  const [showNames, setShowNames] = React.useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
    data: table
  });

  const style: React.CSSProperties = {
    transform: `translate3d(${table.position.x + (transform?.x || 0)}px, ${table.position.y + (transform?.y || 0)}px, 0) rotate(${rotation}deg)`,
    position: 'absolute',
    touchAction: 'none'
  };

  const handleRotate = React.useCallback((direction: 'clockwise' | 'counterclockwise', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newRotation = rotation + (direction === 'clockwise' ? 90 : -90);
    setRotation(newRotation);
    updateTable(table.id, { rotation: newRotation });
  }, [rotation, table.id, updateTable]);

  const handleEditClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowGuestEditor(true);
    setShowTooltip(false);
  }, []);

  const toggleNames = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNames(!showNames);
  }, [showNames]);

  const getTableDimensions = () => {
    switch (table.type) {
      case 'round':
        return 'w-32 h-32 rounded-full';
      case '1-sided':
        return 'w-48 h-24 rounded-lg';
      case '2-sided':
        return 'w-48 h-32 rounded-lg';
      case '4-sided':
        return 'w-32 h-32 rounded-lg';
      default:
        return 'w-32 h-32 rounded-lg';
    }
  };

  const renderGuestNames = () => {
    if (!showNames) return null;
  
    const tableDiameter = 128; // For 'round' table w-32 h-32
    const tableRadius = tableDiameter / 2; // 64px
    const nameOffset = 20; // Adjust this value to move names closer or farther from the table edge
    const radius = tableRadius + nameOffset;
  
    const filledSeats = table.guests.filter(g => g.name);
    const totalSeats = filledSeats.length;
  
    return filledSeats.map((guest, index) => {
      const baseAngle = (index / totalSeats) * 360 - 90;
      const adjustedAngle = baseAngle + rotation;
      const radian = (adjustedAngle * Math.PI) / 180;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;
  
      let textRotation = adjustedAngle;
  
      // Optional: Flip text to keep it readable
      if (textRotation > 90 && textRotation <= 270) {
        textRotation += 180;
      }
  
      return (
        <div
          key={guest.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: `
              translate(-50%, -50%)
              translate(${x}px, ${y}px)
              rotate(${textRotation}deg)
            `,
            transformOrigin: 'center',
          }}
        >
          <div
            className="bg-white/95 px-2 py-1 rounded-full text-xs shadow-sm border border-gray-200 whitespace-nowrap pointer-events-none z-20"
          >
            {guest.name}
          </div>
        </div>
      );
    });
  };
  

  return (
    <>
      <div className="relative group" style={style}>
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
              onClick={toggleNames}
              className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
              type="button"
              title={showNames ? "Hide guest names" : "Show guest names"}
            >
              {showNames ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Table container */}
        <div
          ref={setNodeRef}
          className={`bg-white border-2 border-gray-200 shadow-lg select-none ${getTableDimensions()}`}
        >
          {/* Draggable area with table content */}
          <div
            {...attributes}
            {...listeners}
            className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing"
          >
            <span className="font-semibold text-center text-gray-900">Table {tableNumber}</span>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{table.guests.filter(g => g.name).length}/{table.seats}</span>
            </div>
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
});
