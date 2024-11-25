// src/utils/constants.js
export const RELATIONSHIP_TYPES = {
  NONE: { value: 'none', label: 'No Relationship', weight: 0 },
  SIGNIFICANT_OTHER: { value: 'significant_other', label: 'Significant Other', weight: 10 },
  CLOSE_FRIEND: { value: 'close_friend', label: 'Close Friend', weight: 4 },
  FAMILY: { value: 'family', label: 'Family', weight: 3 },
  FRIEND: { value: 'friend', label: 'Friend', weight: 2 },
  ACQUAINTANCE: { value: 'acquaintance', label: 'Acquaintance', weight: 1 },
  CANNOT_SIT: { value: 'cannot_sit', label: 'Cannot Sit Together', weight: -1000 }
};

export const SEATING_PREFERENCES = {
  FAMILY_FIRST: { value: 'FAMILY_FIRST', label: 'Prefer Family Together' },
  RELATIONSHIPS_FIRST: { value: 'RELATIONSHIPS_FIRST', label: 'Prefer Friendships' },
  BALANCED: { value: 'BALANCED', label: 'Balanced Approach' }
};
