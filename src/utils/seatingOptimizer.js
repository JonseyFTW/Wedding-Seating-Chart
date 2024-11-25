// src/utils/seatingOptimizer.js
import { RELATIONSHIP_TYPES, SEATING_PREFERENCES } from './constants.js';

export const optimizeSeating = async (guests, relationships, blacklist, tables, seatingPreference) => {
  const n = guests.length;
  const matrix = Array(n).fill().map(() => Array(n).fill(0));
  
  // Build relationship weights
  relationships.forEach(rel => {
    const i = guests.findIndex(g => g.id === rel.source);
    const j = guests.findIndex(g => g.id === rel.target);
    if (i !== -1 && j !== -1) {
      const weight = getRelationshipWeight(rel.type, seatingPreference);
      matrix[i][j] = weight;
      matrix[j][i] = weight;
    }
  });

  // Apply blacklist constraints
  blacklist.forEach(restriction => {
    const i = guests.findIndex(g => g.id === restriction.source);
    const j = guests.findIndex(g => g.id === restriction.target);
    if (i !== -1 && j !== -1) {
      matrix[i][j] = RELATIONSHIP_TYPES.BLACKLIST.weight;
      matrix[j][i] = RELATIONSHIP_TYPES.BLACKLIST.weight;
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

const getRelationshipWeight = (relationshipType, seatingPreference) => {
  const baseWeight = RELATIONSHIP_TYPES[relationshipType]?.weight || RELATIONSHIP_TYPES.NONE.weight;
  
  switch (seatingPreference) {
    case SEATING_PREFERENCES.FAMILY_FIRST.value:
      return relationshipType === 'FAMILY' ? baseWeight * 1.5 : baseWeight;
    case SEATING_PREFERENCES.RELATIONSHIPS_FIRST.value:
      return relationshipType === 'CLOSE_FRIEND' ? baseWeight * 1.5 : baseWeight;
    default:
      return baseWeight;
  }
};

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
    } else if (relationshipScore === RELATIONSHIP_TYPES.BLACKLIST.weight) {
      // Apply blacklist penalty
      score += relationshipScore;
    }
  }

  return score;
};
