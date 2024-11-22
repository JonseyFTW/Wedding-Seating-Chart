import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event, Table, Guest, Furniture } from '../types';

interface StoreState {
  events: Event[];
  currentEvent: Event | null;
  setCurrentEvent: (event: Event) => void;
  addEvent: (event: Event) => void;
  addTable: (table: Table) => void;
  updateTable: (tableId: string, updates: Partial<Table>) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (guestId: string, updates: Partial<Guest>) => void;
  addFurniture: (furniture: Furniture) => void;
  updateFurniture: (furnitureId: string, updates: Partial<Furniture>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      events: [],
      currentEvent: null,
      setCurrentEvent: (event) => set({ currentEvent: event }),
      addEvent: (event) =>
        set((state) => ({ events: [...state.events, event] })),
      addTable: (table) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedEvent = {
            ...state.currentEvent,
            tables: [...state.currentEvent.tables],
            furniture: state.currentEvent.furniture || []
          };
          updatedEvent.tables.push(table);
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      updateTable: (tableId, updates) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedTables = state.currentEvent.tables.map((table) =>
            table.id === tableId ? { ...table, ...updates } : table
          );
          const updatedEvent = {
            ...state.currentEvent,
            tables: updatedTables,
            furniture: state.currentEvent.furniture || []
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      addGuest: (guest) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedTables = state.currentEvent.tables.map((table) =>
            table.id === guest.tableId
              ? { ...table, guests: [...table.guests, guest] }
              : table
          );
          const updatedEvent = {
            ...state.currentEvent,
            tables: updatedTables,
            furniture: state.currentEvent.furniture || []
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      updateGuest: (guestId, updates) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedTables = state.currentEvent.tables.map((table) => ({
            ...table,
            guests: table.guests.map((guest) =>
              guest.id === guestId ? { ...guest, ...updates } : guest
            ),
          }));
          const updatedEvent = {
            ...state.currentEvent,
            tables: updatedTables,
            furniture: state.currentEvent.furniture || []
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      addFurniture: (furniture) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedEvent = {
            ...state.currentEvent,
            tables: state.currentEvent.tables,
            furniture: [...(state.currentEvent.furniture || []), furniture]
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      updateFurniture: (furnitureId, updates) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedFurniture = (state.currentEvent.furniture || []).map((item) =>
            item.id === furnitureId ? { ...item, ...updates } : item
          );
          const updatedEvent = {
            ...state.currentEvent,
            tables: state.currentEvent.tables,
            furniture: updatedFurniture
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
    }),
    {
      name: 'seating-chart-storage',
      version: 1,
    }
  )
);