// src/utils/seatingOptimizer.js
import { RELATIONSHIP_TYPES, SEATING_PREFERENCES } from './constants';

const calculateTableScore = (matrix, guestIndex, tableAssignments) => {
  if (tableAssignments.length === 0) return 0;

  let score = 0;
  for (const assignedGuest of tableAssignments) {
    const relationshipScore = matrix[guestIndex][assignedGuest];
    
    if (relationshipScore > 0) {
      // Add the weighted relationship score
      score += relationshipScore;
      
      // Add bonus for common connections
      const commonConnections = matrix[guestIndex].reduce((acc, val, i) => {
        if (val > 0 && matrix[assignedGuest][i] > 0) acc++;
        return acc;
      }, 0);
      score += commonConnections * 0.5;
    } else if (relationshipScore === RELATIONSHIP_TYPES.CANNOT_SIT.weight) {
      // Apply blacklist penalty
      score += relationshipScore;
    }
  }

  return score;
};

const calculateOptimalSeating = async (matrix, tables, guests) => {
  const assignments = [];
  const totalGuests = guests.length;
  const availableSeats = tables.reduce((acc, table) => acc + table.seats, 0);

  if (totalGuests > availableSeats) {
    throw new Error('Not enough seats for all guests');
  }

  // Initialize tables with empty arrays
  tables.forEach(() => assignments.push([]));

  // Sort guests by their connection count (most connected first)
  const guestConnections = matrix.map((row, index) => ({
    index,
    connections: row.reduce((acc, val) => acc + (val > 0 ? 1 : 0), 0)
  }));

  guestConnections.sort((a, b) => b.connections - a.connections);

  // Assign guests to tables
  for (const guest of guestConnections) {
    let bestTable = 0;
    let bestScore = -Infinity;

    // Find the best table for this guest
    for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
      if (assignments[tableIndex].length >= tables[tableIndex].seats) continue;

      const score = calculateTableScore(matrix, guest.index, assignments[tableIndex]);
      if (score > bestScore) {
        bestScore = score;
        bestTable = tableIndex;
      }
    }

    assignments[bestTable].push(guest.index);
  }

  return assignments;
};

export const optimizeSeating = async (guests, relationships, blacklist, tables) => {
  const n = guests.length;
  const matrix = Array(n).fill().map(() => Array(n).fill(0));
  
  // Build relationship weights
  relationships.forEach(rel => {
    const i = guests.findIndex(g => g.id === rel.source);
    const j = guests.findIndex(g => g.id === rel.target);
    if (i !== -1 && j !== -1) {
      matrix[i][j] = RELATIONSHIP_TYPES.CLOSE_FRIEND.weight; // Default to close friend weight
      matrix[j][i] = RELATIONSHIP_TYPES.CLOSE_FRIEND.weight;
    }
  });

  // Apply blacklist constraints
  blacklist.forEach(restriction => {
    const i = guests.findIndex(g => g.id === restriction.source);
    const j = guests.findIndex(g => g.id === restriction.target);
    if (i !== -1 && j !== -1) {
      matrix[i][j] = RELATIONSHIP_TYPES.CANNOT_SIT.weight;
      matrix[j][i] = RELATIONSHIP_TYPES.CANNOT_SIT.weight;
    }
  });

  const assignments = await calculateOptimalSeating(matrix, tables, guests);
  
  return tables.map((table, tableIndex) => ({
    ...table,
    guests: assignments[tableIndex].map(guestIndex => ({
      ...guests[guestIndex],
      tableId: table.id
    }))
  }));
};