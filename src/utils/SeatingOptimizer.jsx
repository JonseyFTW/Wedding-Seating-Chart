// Seating optimization algorithm using a weighted graph approach
export const optimizeSeating = async (guests, relationships, blacklist, tables) => {
  // Create adjacency matrix for guest relationships
  const n = guests.length;
  const matrix = Array(n).fill().map(() => Array(n).fill(0));
  
  // Build relationship weights
  relationships.forEach(rel => {
    const i = guests.findIndex(g => g.id === rel.source);
    const j = guests.findIndex(g => g.id === rel.target);
    if (i !== -1 && j !== -1) {
      matrix[i][j] = 1;
      matrix[j][i] = 1;
    }
  });

  // Apply blacklist constraints
  blacklist.forEach(restriction => {
    const i = guests.findIndex(g => g.id === restriction.source);
    const j = guests.findIndex(g => g.id === restriction.target);
    if (i !== -1 && j !== -1) {
      matrix[i][j] = -1;
      matrix[j][i] = -1;
    }
  });

  // Calculate optimal seating arrangement
  const assignments = await calculateOptimalSeating(matrix, tables, guests);
  
  // Update table assignments
  return tables.map((table, tableIndex) => ({
    ...table,
    guests: assignments[tableIndex].map(guestIndex => ({
      ...guests[guestIndex],
      tableId: table.id
    }))
  }));
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

const calculateTableScore = (matrix, guestIndex, tableAssignments) => {
  if (tableAssignments.length === 0) return 0;

  let score = 0;
  for (const assignedGuest of tableAssignments) {
    // Add points for positive relationships
    if (matrix[guestIndex][assignedGuest] > 0) {
      score += 2;
    }
    // Add points for indirect relationships (common connections)
    else {
      const commonConnections = matrix[guestIndex].reduce((acc, val, i) => {
        if (val > 0 && matrix[assignedGuest][i] > 0) acc++;
        return acc;
      }, 0);
      score += commonConnections * 0.5;
    }
    // Heavily penalize blacklisted relationships
    if (matrix[guestIndex][assignedGuest] < 0) {
      score -= 1000;
    }
  }

  return score;
};