export interface Guest {
  id: string;
  name: string;
  tableId: string;
  seatNumber: number;
}

export interface Table {
  id: string;
  type: 'round' | '1-sided' | '2-sided' | '4-sided';
  seats: number;
  position: { x: number; y: number };
  rotation?: number;
  guests: Guest[];
}

export interface Furniture {
  id: string;
  type: 'danceFloor' | 'bar' | 'photoBooth' | 'dj' | 'giftTable' | 'cakeTable' | 'entrance';
  position: { x: number; y: number };
  rotation: number;
  size: { width: number; height: number };
}

export interface Event {
  id: string;
  name: string;
  tables: Table[];
  furniture: Furniture[];
}