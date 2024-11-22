import React, { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Table, Guest } from '../types';
import { X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GuestEditorProps {
  table: Table;
  tableNumber: number;
  onClose: () => void;
}

interface SortableGuestItemProps {
  guest: Guest;
  seatNumber: number;
  onRemove: () => void;
}

const SortableGuestItem: React.FC<SortableGuestItemProps> = React.memo(({ guest, seatNumber, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: guest.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <span className="w-8 text-gray-500">#{seatNumber}</span>
      <span className="flex-1">{guest.name || 'Empty seat'}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
        type="button"
        aria-label="Remove guest"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
});

SortableGuestItem.displayName = 'SortableGuestItem';

export const GuestEditor: React.FC<GuestEditorProps> = React.memo(({ table, tableNumber, onClose }) => {
  const { addGuest, updateGuest, updateTable } = useStore();
  const [guestName, setGuestName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const emptySeats = Array.from({ length: table.seats }, (_, i) => i + 1)
      .filter(seat => !table.guests.find(g => g.seatNumber === seat));

    if (emptySeats.length === 0) return;

    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name: guestName.trim(),
      tableId: table.id,
      seatNumber: emptySeats[0],
    };

    addGuest(newGuest);
    setGuestName('');
    inputRef.current?.focus();
  };

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = table.guests.findIndex(g => g.id === active.id);
      const newIndex = table.guests.findIndex(g => g.id === over.id);
      
      const newGuests = arrayMove(table.guests, oldIndex, newIndex);
      const updatedGuests = newGuests.map((guest, index) => ({
        ...guest,
        seatNumber: index + 1,
      }));
      
      updateTable(table.id, { guests: updatedGuests });
    }
  }, [table, updateTable]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Table {tableNumber}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            aria-label="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAddGuest} className="mb-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter guest name"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Guest name"
            />
            <button
              type="submit"
              disabled={!guestName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 hover:bg-blue-700 active:bg-blue-800"
            >
              Add Guest
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={table.guests.map(g => g.id)}
              strategy={verticalListSortingStrategy}
            >
              {Array.from({ length: table.seats }, (_, i) => {
                const seatNumber = i + 1;
                const guest = table.guests.find(g => g.seatNumber === seatNumber);
                
                return guest ? (
                  <SortableGuestItem
                    key={guest.id}
                    guest={guest}
                    seatNumber={seatNumber}
                    onRemove={() => updateGuest(guest.id, { name: '' })}
                  />
                ) : (
                  <div key={`empty-${seatNumber}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="w-8 text-gray-500">#{seatNumber}</span>
                    <span className="text-gray-400">Empty seat</span>
                  </div>
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
});

GuestEditor.displayName = 'GuestEditor';