import React, { useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Users, Edit2, RotateCcw, RotateCw, Eye, EyeOff } from 'lucide-react';
import { GuestEditor } from './GuestEditor';
import { useStore } from '../store/useStore';

export const Table = ({ table, tableNumber, showNames }) => {
  const { updateTable, setAllTablesInactive, setAllTablesActive } = useStore();
  const [showGuestEditor, setShowGuestEditor] = useState(false);
  const [localRotation, setLocalRotation] = useState(table.rotation || 0);
  const [guestNamesVisible, setGuestNamesVisible] = useState(showNames);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
    data: table,
    disabled: showGuestEditor,
  });

  const getTableDimensions = () => {
    switch (table.type) {
      case 'round':
        return {
          width: 128,
          height: 128,
          borderRadius: '50%',
        };
      case '1-sided':
        return { width: 192, height: 96, borderRadius: '0.5rem' };
      case '2-sided':
        return { width: 192, height: 128, borderRadius: '0.5rem' };
      case '4-sided':
        return { width: 128, height: 128, borderRadius: '0.5rem' };
      default:
        return { width: 128, height: 128, borderRadius: '50%' };
    }
  };

  const tableDimensions = getTableDimensions();

  const draggableStyle = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${localRotation}deg)`
      : `rotate(${localRotation}deg)`,
    zIndex: showGuestEditor ? 10 : 1,
  };

  const style = {
    position: 'absolute',
    touchAction: 'none',
    width: `${tableDimensions.width}px`,
    height: `${tableDimensions.height}px`,
    borderRadius: tableDimensions.borderRadius,
    left: `${table.position.x}px`,
    top: `${table.position.y}px`,
    pointerEvents: showGuestEditor ? 'none' : 'auto',
  };

  const handleRotate = useCallback(
    (direction, e) => {
      e.preventDefault();
      e.stopPropagation();
      const newRotation = localRotation + (direction === 'clockwise' ? 90 : -90);
      setLocalRotation(newRotation);
      updateTable(table.id, { rotation: newRotation });
    },
    [localRotation, table.id, updateTable]
  );

  const handleEditClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowGuestEditor(true);
      setAllTablesInactive();
    },
    [setAllTablesInactive]
  );

  const handleCloseGuestEditor = useCallback(() => {
    setShowGuestEditor(false);
    setAllTablesActive();
  }, [setAllTablesActive]);

  const toggleGuestNamesVisibility = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setGuestNamesVisible((prevState) => !prevState);
  }, []);

  const renderGuestNames = () => {
    if (!guestNamesVisible) return null;

    const tableDiameter = tableDimensions.width;
    const tableRadius = tableDiameter / 2;
    const labelPadding = 20;
    const radius = tableRadius + labelPadding;

    const filledSeats = table.guests.filter((g) => g.name);
    const totalSeats = filledSeats.length;

    if (totalSeats === 0) return null;

    return filledSeats.map((guest, index) => {
      const baseAngle = (index / totalSeats) * 360 - 90;
      const adjustedAngle = baseAngle + localRotation;
      const radian = (adjustedAngle * Math.PI) / 180;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      let textRotation = adjustedAngle;
      if (textRotation > 90 && textRotation <= 270) {
        textRotation += 180;
      }

      return (
        <div
          key={guest.id}
          className="absolute"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        >
          <div className="bg-white px-2 py-1 rounded-full text-xs shadow-md border border-[#F4E1B2] whitespace-nowrap z-20">
            {guest.name}
          </div>
        </div>
      );
    });
  };

  const getTableContentClasses = () => {
    const baseClasses =
      'bg-white border-2 border-[#F4E1B2] shadow-lg select-none flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing';
    return table.type === 'round' ? `${baseClasses} rounded-full round-table` : `${baseClasses} rounded-lg`;
  };
  
  return (
    <>
      <div className="relative group" style={{ ...style, zIndex: showGuestEditor ? 10 : 1 }}>
        {/* Controls positioned at the top */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <div className="flex items-center gap-1 bg-[#F4E1B2] rounded-full px-2 py-1 shadow-md border border-[#E5C594]">
            <button
              onClick={(e) => handleRotate('counterclockwise', e)}
              className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
              type="button"
              title="Rotate counterclockwise"
            >
              <RotateCcw className="w-4 h-4 text-[#646E78]" />
            </button>
            <button
              onClick={(e) => handleRotate('clockwise', e)}
              className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
              type="button"
              title="Rotate clockwise"
            >
              <RotateCw className="w-4 h-4 text-[#646E78]" />
            </button>
            <button
              onClick={handleEditClick}
              className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
              type="button"
              title="Edit guests"
            >
              <Edit2 className="w-4 h-4 text-[#646E78]" />
            </button>
            <button
              onClick={toggleGuestNamesVisibility}
              className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
              type="button"
              title={guestNamesVisible ? 'Hide guest names' : 'Show guest names'}
            >
              {guestNamesVisible ? <EyeOff className="w-4 h-4 text-[#646E78]" /> : <Eye className="w-4 h-4 text-[#646E78]" />}
            </button>
          </div>
        </div>

        {/* Table container */}
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={draggableStyle}
          className={getTableContentClasses()}
        >
          <span className="font-semibold text-center text-[#646E78]">Table {tableNumber}</span>
          <div className="flex items-center justify-center gap-1 text-sm text-[#646E78]">
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <GuestEditor table={table} tableNumber={tableNumber} onClose={handleCloseGuestEditor} />
        </div>
      )}
    </>
  );
};
