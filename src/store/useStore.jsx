import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
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
            tables: [
              ...state.currentEvent.tables,
              { ...table, active: true },
            ],
            furniture: state.currentEvent.furniture || [],
          };
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
            furniture: state.currentEvent.furniture || [],
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
            furniture: state.currentEvent.furniture || [],
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
            furniture: state.currentEvent.furniture || [],
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
            furniture: [
              ...(state.currentEvent.furniture || []),
              furniture,
            ],
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
          const updatedFurniture = (state.currentEvent.furniture || []).map(
            (item) =>
              item.id === furnitureId ? { ...item, ...updates } : item
          );
          const updatedEvent = {
            ...state.currentEvent,
            tables: state.currentEvent.tables,
            furniture: updatedFurniture,
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      setAllTablesActive: () =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedTables = state.currentEvent.tables.map((table) => ({
            ...table,
            active: true,
          }));
          const updatedEvent = {
            ...state.currentEvent,
            tables: updatedTables,
            furniture: state.currentEvent.furniture || [],
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      setAllTablesInactive: () =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedTables = state.currentEvent.tables.map((table) => ({
            ...table,
            active: false,
          }));
          const updatedEvent = {
            ...state.currentEvent,
            tables: updatedTables,
            furniture: state.currentEvent.furniture || [],
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      // AI Seating Related Actions
      updateEventWithAISeating: (tables) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedEvent = {
            ...state.currentEvent,
            tables: tables.map(table => ({
              ...table,
              active: true,
            })),
            furniture: state.currentEvent.furniture || [],
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      addGuestRelationship: (guest1Id, guest2Id) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedEvent = {
            ...state.currentEvent,
            relationships: [
              ...(state.currentEvent.relationships || []),
              { source: guest1Id, target: guest2Id }
            ]
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      addGuestBlacklist: (guest1Id, guest2Id) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedEvent = {
            ...state.currentEvent,
            blacklist: [
              ...(state.currentEvent.blacklist || []),
              { source: guest1Id, target: guest2Id }
            ]
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      removeGuestRelationship: (guest1Id, guest2Id) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedEvent = {
            ...state.currentEvent,
            relationships: (state.currentEvent.relationships || []).filter(
              rel => !(rel.source === guest1Id && rel.target === guest2Id) &&
                    !(rel.source === guest2Id && rel.target === guest1Id)
            )
          };
          return {
            currentEvent: updatedEvent,
            events: state.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          };
        }),
      removeGuestBlacklist: (guest1Id, guest2Id) =>
        set((state) => {
          if (!state.currentEvent) return state;
          const updatedEvent = {
            ...state.currentEvent,
            blacklist: (state.currentEvent.blacklist || []).filter(
              rel => !(rel.source === guest1Id && rel.target === guest2Id) &&
                    !(rel.source === guest2Id && rel.target === guest1Id)
            )
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