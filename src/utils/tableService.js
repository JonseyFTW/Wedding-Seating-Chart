// tableService.js

import { db } from '../firebase';
import { 
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

/**
 * Recursively removes all undefined values from an object.
 * @param {Object|Array} data - The data object or array to clean.
 * @returns {Object|Array} - The cleaned data object or array.
 */
const cleanData = (data) => {
  if (Array.isArray(data)) {
    return data
      .map(item => cleanData(item))
      .filter(item => item !== undefined && item !== null);
  } else if (data !== null && typeof data === 'object') {
    const cleanedObject = {};
    Object.keys(data).forEach(key => {
      const value = cleanData(data[key]);
      if (value !== undefined && value !== null) {
        cleanedObject[key] = value;
      }
    });
    return cleanedObject;
  }
  return data;
};

/**
 * Creates a sanitized table object.
 * @param {Object} table - The table data.
 * @returns {Object} - The sanitized table object.
 */
const createTableData = (table) => ({
  id: table.id || '',
  type: table.type || '',
  seats: table.seats || 0,
  position: {
    x: table.position?.x || 0,
    y: table.position?.y || 0
  },
  guests: Array.isArray(table.guests)
    ? table.guests.map(guest => ({
        id: guest.id || '',
        name: guest.name || '',
        seatNumber: guest.seatNumber || '',
        tableId: guest.tableId || ''
      }))
    : [],
  rotation: table.rotation || 0
});

/**
 * Creates a sanitized furniture object.
 * @param {Object} item - The furniture item data.
 * @returns {Object} - The sanitized furniture object.
 */
const createFurnitureData = (item) => ({
  id: item.id || '',
  type: item.type || '',
  position: {
    x: item.position?.x || 0,
    y: item.position?.y || 0
  },
  size: {
    width: item.size?.width || 40, // Default width
    height: item.size?.height || 40 // Default height
  },
  rotation: item.rotation || 0
});

/**
 * Saves a new table layout to Firestore.
 * @param {string} userId - The ID of the user saving the layout.
 * @param {string} layoutName - The name of the layout.
 * @param {Object} layout - The layout data.
 * @returns {Promise<string>} - The ID of the newly created layout document.
 */
export const saveTableLayout = async (userId, layoutName, layout) => {
  if (!userId) {
    toast.error('You must be logged in to save layouts');
    throw new Error('User not authenticated');
  }

  try {
    const layoutsRef = collection(db, 'tableLayouts');

    // Sanitize tables and furniture data
    const tables = Array.isArray(layout.tables) ? layout.tables.map(createTableData) : [];
    const furniture = Array.isArray(layout.furniture) ? layout.furniture.map(createFurnitureData) : [];

    const layoutData = cleanData({
      userId,
      name: layoutName,
      eventName: layout.name || '',
      tables,
      furniture,
      aiPlannerData: layout.aiPlannerData || {
        guests: [],
        relationships: [],
        blacklist: []
      },
      createdAt: new Date().toISOString()
    });

    const docRef = await addDoc(layoutsRef, layoutData);
    toast.success('Layout saved successfully!');
    return docRef.id;
  } catch (error) {
    console.error('Error saving layout:', error);
    toast.error('Failed to save layout');
    throw error;
  }
};

/**
 * Retrieves all table layouts for a specific user from Firestore.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - An array of table layouts.
 */
export const getTableLayouts = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const layoutsRef = collection(db, 'tableLayouts');
    const q = query(layoutsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return cleanData({
        id: docSnap.id,
        name: data.name,
        eventName: data.eventName || '',
        tables: Array.isArray(data.tables)
          ? data.tables.map(createTableData)
          : [],
        furniture: Array.isArray(data.furniture)
          ? data.furniture.map(createFurnitureData)
          : [],
        aiPlannerData: data.aiPlannerData || {
          guests: [],
          relationships: [],
          blacklist: []
        },
        createdAt: data.createdAt
      });
    });
  } catch (error) {
    console.error('Error getting layouts:', error);
    toast.error('Failed to load layouts');
    throw error;
  }
};

/**
 * Deletes a table layout from Firestore.
 * @param {string} layoutId - The ID of the layout to delete.
 * @returns {Promise<void>}
 */
export const deleteTableLayout = async (layoutId) => {
  try {
    const layoutRef = doc(db, 'tableLayouts', layoutId);
    await deleteDoc(layoutRef);
    toast.success('Layout deleted successfully');
  } catch (error) {
    console.error('Error deleting layout:', error);
    toast.error('Failed to delete layout');
    throw error;
  }
};

/**
 * Updates an existing table layout in Firestore.
 * @param {string} layoutId - The ID of the layout to update.
 * @param {Object} layout - The updated layout data.
 * @returns {Promise<void>}
 */
export const updateTableLayout = async (layoutId, layout) => {
  try {
    const layoutRef = doc(db, 'tableLayouts', layoutId);

    // Sanitize tables and furniture data
    const tables = Array.isArray(layout.tables) ? layout.tables.map(createTableData) : [];
    const furniture = Array.isArray(layout.furniture) ? layout.furniture.map(createFurnitureData) : [];

    const layoutData = cleanData({
      tables,
      furniture,
      aiPlannerData: layout.aiPlannerData || {
        guests: [],
        relationships: [],
        blacklist: []
      },
      updatedAt: new Date().toISOString()
    });

    await updateDoc(layoutRef, layoutData);
    toast.success('Layout updated successfully');
  } catch (error) {
    console.error('Error updating layout:', error);
    toast.error('Failed to update layout');
    throw error;
  }
};
