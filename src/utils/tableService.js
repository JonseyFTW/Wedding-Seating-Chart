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

export const saveTableLayout = async (userId, layoutName, layout) => {
  if (!userId) {
    toast.error('You must be logged in to save layouts');
    throw new Error('User not authenticated');
  }

  try {
    const layoutsRef = collection(db, 'tableLayouts');
    
    // Ensure tables and furniture are arrays before saving
    const tables = Array.isArray(layout.tables) ? layout.tables : [];
    const furniture = Array.isArray(layout.furniture) ? layout.furniture : [];

    const layoutData = {
      userId,
      name: layoutName,
      eventName: layout.name || '',
      tables: tables.map(table => ({
        id: table.id,
        type: table.type,
        seats: table.seats,
        position: {
          x: table.position.x,
          y: table.position.y
        },
        guests: Array.isArray(table.guests) ? table.guests.map(guest => ({
          id: guest.id,
          name: guest.name,
          seatNumber: guest.seatNumber,
          tableId: guest.tableId
        })) : [],
        rotation: table.rotation || 0
      })),
      furniture: furniture.map(item => ({
        id: item.id,
        type: item.type,
        position: {
          x: item.position.x,
          y: item.position.y
        },
        size: {
          width: item.size.width,
          height: item.size.height
        },
        rotation: item.rotation || 0
      })),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(layoutsRef, layoutData);
    toast.success('Layout saved successfully!');
    return docRef.id;
  } catch (error) {
    console.error('Error saving layout:', error);
    toast.error('Failed to save layout');
    throw error;
  }
};

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

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        eventName: data.eventName || '',
        tables: Array.isArray(data.tables) ? data.tables.map(table => ({
          id: table.id,
          type: table.type,
          seats: table.seats,
          position: {
            x: table.position.x,
            y: table.position.y
          },
          guests: Array.isArray(table.guests) ? table.guests.map(guest => ({
            id: guest.id,
            name: guest.name,
            seatNumber: guest.seatNumber,
            tableId: guest.tableId
          })) : [],
          rotation: table.rotation || 0
        })) : [],
        furniture: Array.isArray(data.furniture) ? data.furniture.map(item => ({
          id: item.id,
          type: item.type,
          position: {
            x: item.position.x,
            y: item.position.y
          },
          size: {
            width: item.size.width,
            height: item.size.height
          },
          rotation: item.rotation || 0
        })) : [],
        createdAt: data.createdAt
      };
    });
  } catch (error) {
    console.error('Error getting layouts:', error);
    toast.error('Failed to load layouts');
    throw error;
  }
};

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

export const updateTableLayout = async (layoutId, layout) => {
  try {
    const layoutRef = doc(db, 'tableLayouts', layoutId);
    
    // Ensure tables and furniture are arrays before updating
    const tables = Array.isArray(layout.tables) ? layout.tables : [];
    const furniture = Array.isArray(layout.furniture) ? layout.furniture : [];

    const layoutData = {
      tables: tables.map(table => ({
        id: table.id,
        type: table.type,
        seats: table.seats,
        position: {
          x: table.position.x,
          y: table.position.y
        },
        guests: Array.isArray(table.guests) ? table.guests.map(guest => ({
          id: guest.id,
          name: guest.name,
          seatNumber: guest.seatNumber,
          tableId: guest.tableId
        })) : [],
        rotation: table.rotation || 0
      })),
      furniture: furniture.map(item => ({
        id: item.id,
        type: item.type,
        position: {
          x: item.position.x,
          y: item.position.y
        },
        size: {
          width: item.size.width,
          height: item.size.height
        },
        rotation: item.rotation || 0
      })),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(layoutRef, layoutData);
    toast.success('Layout updated successfully');
  } catch (error) {
    console.error('Error updating layout:', error);
    toast.error('Failed to update layout');
    throw error;
  }
};