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

export const saveTableLayout = async (userId, layoutName, tableData) => {
  try {
    const layoutsRef = collection(db, 'tableLayouts');
    await addDoc(layoutsRef, {
      userId,
      name: layoutName,
      tables: tableData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
};

export const getTableLayouts = async (userId) => {
  try {
    const layoutsRef = collection(db, 'tableLayouts');
    const q = query(layoutsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting layouts:', error);
    throw error;
  }
};

export const deleteTableLayout = async (layoutId) => {
  try {
    const layoutRef = doc(db, 'tableLayouts', layoutId);
    await deleteDoc(layoutRef);
  } catch (error) {
    console.error('Error deleting layout:', error);
    throw error;
  }
};

export const updateTableLayout = async (layoutId, tableData) => {
  try {
    const layoutRef = doc(db, 'tableLayouts', layoutId);
    await updateDoc(layoutRef, {
      tables: tableData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating layout:', error);
    throw error;
  }
};