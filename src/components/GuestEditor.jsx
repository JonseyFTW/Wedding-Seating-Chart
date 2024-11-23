// src/components/GuestEditor.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { X, GripVertical, Edit2, Check, XCircle, Heart } from 'lucide-react';
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

const SortableGuestItem = React.memo(
  ({ guest, seatNumber, onRemove, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(guest.name);
    const editInputRef = useRef(null);

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

    useEffect(() => {
      if (isEditing && editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, [isEditing]);

    const handleEditSubmit = (e) => {
      e?.preventDefault();
      if (editedName.trim()) {
        onEdit(editedName.trim());
        setIsEditing(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditedName(guest.name);
        setIsEditing(false);
      }
    };

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    if (isEditing) {
      return (
        <form
          ref={setNodeRef}
          style={style}
          className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border-2 border-[#F4E1B2] w-full"
          onSubmit={handleEditSubmit}
        >
          <div {...attributes} {...listeners} className="cursor-grab touch-none">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <span className="w-8 text-gray-500 font-medium">#{seatNumber}</span>
          <input
            ref={editInputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4E1B2] font-serif text-[#646E78]"
          />
          <div className="flex items-center gap-1">
            <button
              type="submit"
              className="p-1.5 hover:bg-green-50 text-green-600 rounded-full active:bg-green-100"
              title="Save changes"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditedName(guest.name);
                setIsEditing(false);
              }}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded-full active:bg-red-100"
              title="Cancel editing"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </form>
      );
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-[#F4E1B2] w-full group"
      >
        <div {...attributes} {...listeners} className="cursor-grab touch-none">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <span className="w-8 text-gray-500 font-medium">#{seatNumber}</span>
        <span className="flex-1 truncate font-serif text-[#646E78]">
          {guest.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-gray-100 rounded-full active:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            type="button"
            title="Edit guest"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            title="Remove guest"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }
);

SortableGuestItem.displayName = 'SortableGuestItem';

export const GuestEditor = React.memo(({ table, tableNumber, onClose }) => {
  const { updateTable } = useStore();
  const [guestName, setGuestName] = useState('');
  const inputRef = useRef(null);

  // Filter out empty guest entries
  const filledGuests = table.guests.filter((g) => g.name.trim() !== '');

  useEffect(() => {
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

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const occupiedSeats = new Set(filledGuests.map((g) => g.seatNumber));
    let firstEmptySeat = 1;
    while (
      occupiedSeats.has(firstEmptySeat) &&
      firstEmptySeat <= table.seats
    ) {
      firstEmptySeat++;
    }

    if (firstEmptySeat <= table.seats) {
      const newGuest = {
        id: crypto.randomUUID(),
        name: guestName.trim(),
        tableId: table.id,
        seatNumber: firstEmptySeat,
      };

      // Update the table with the new guest
      updateTable(table.id, {
        guests: [...filledGuests, newGuest].sort(
          (a, b) => a.seatNumber - b.seatNumber
        ),
      });

      setGuestName('');
      inputRef.current?.focus();
    }
  };

  const handleRemoveGuest = (guestId) => {
    const updatedGuests = filledGuests
      .filter((g) => g.id !== guestId)
      .map((guest, index) => ({
        ...guest,
        seatNumber: index + 1,
      }));

    updateTable(table.id, { guests: updatedGuests });
  };

  const handleEditGuest = (guestId, newName) => {
    const updatedGuests = filledGuests.map((guest) =>
      guest.id === guestId ? { ...guest, name: newName } : guest
    );
    updateTable(table.id, { guests: updatedGuests });
  };

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = filledGuests.findIndex((g) => g.id === active.id);
        const newIndex = filledGuests.findIndex((g) => g.id === over.id);

        const newGuests = arrayMove(filledGuests, oldIndex, newIndex);
        const updatedGuests = newGuests.map((guest, index) => ({
          ...guest,
          seatNumber: index + 1,
        }));

        updateTable(table.id, { guests: updatedGuests });
      }
    },
    [filledGuests, table.id, updateTable]
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 pt-16 md:pt-24 p-4 pb-16 md:pb-24 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto overflow-hidden mt-4 md:mt-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Updated Header Section */}
        <div className="relative flex items-center justify-center mb-4 p-6 border-b border-[#F4E1B2]">
          {/* Heart Icon */}
          <Heart className="w-8 h-8 text-[#D3A6B8] mr-2" />
          
          {/* Table Number */}
          <h3 className="text-2xl font-serif text-[#646E78]">
            Table {tableNumber}
          </h3>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            aria-label="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rest of the GuestEditor Content */}
        <div className="px-6 pb-16 md:pb-24">
          {/* Add Guest Form */}
          <form onSubmit={handleAddGuest} className="mb-6">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest name"
                className="flex-1 rounded-lg border-2 border-[#F4E1B2] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#F4E1B2] font-serif text-[#646E78]"
                aria-label="Guest name"
              />
              <button
                type="submit"
                disabled={!guestName.trim() || filledGuests.length >= table.seats}
                className="px-8 py-3 rounded-lg border-2 border-[#F4E1B2] hover:bg-[#F4E1B2]/10 transition-colors font-serif text-[#646E78] disabled:border-gray-400 disabled:text-gray-400"
              >
                Add Guest
              </button>
            </div>
            {filledGuests.length >= table.seats && (
              <p className="mt-2 text-sm text-red-600">
                This table is full. Remove a guest before adding a new one.
              </p>
            )}
          </form>

          {/* Guests List */}
          <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filledGuests.map((g) => g.id)}
                strategy={verticalListSortingStrategy}
              >
                {Array.from({ length: table.seats }, (_, i) => {
                  const seatNumber = i + 1;
                  const guest = filledGuests.find(
                    (g) => g.seatNumber === seatNumber
                  );

                  return guest ? (
                    <SortableGuestItem
                      key={guest.id}
                      guest={guest}
                      seatNumber={seatNumber}
                      onRemove={() => handleRemoveGuest(guest.id)}
                      onEdit={(name) => handleEditGuest(guest.id, name)}
                    />
                  ) : (
                    <div
                      key={`empty-${seatNumber}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg w-full"
                    >
                      <div className="w-4" />
                      <span className="w-8 text-gray-500 font-medium">
                        #{seatNumber}
                      </span>
                      <span className="text-gray-400 font-serif">
                        Empty seat
                      </span>
                    </div>
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
});

GuestEditor.displayName = 'GuestEditor';
