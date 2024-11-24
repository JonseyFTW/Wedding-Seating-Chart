import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { saveTableLayout, updateTableLayout } from '../utils/tableService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const SaveLayoutModal = ({ isOpen, onClose, currentLayout }) => {
  const [layoutName, setLayoutName] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Pre-fill the layout name if it's an existing layout
    if (currentLayout?.name && currentLayout?.isLoadedLayout) {
      setLayoutName(currentLayout.name);
    }
  }, [currentLayout]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!layoutName.trim()) return;

    try {
      const layoutData = {
        ...currentLayout,
        tables: currentLayout.tables.map(table => ({
          ...table,
          position: { ...table.position },
          guests: [...table.guests],
          rotation: table.rotation || 0
        })),
        furniture: currentLayout.furniture ? currentLayout.furniture.map(item => ({
          ...item,
          position: { ...item.position },
          size: { ...item.size }
        })) : []
      };

      // If it's an existing layout, update it instead of creating a new one
      if (currentLayout.isLoadedLayout && currentLayout.id) {
        await updateTableLayout(currentLayout.id, layoutData);
      } else {
        await saveTableLayout(currentUser.uid, layoutName, layoutData);
      }

      setLayoutName('');
      onClose();
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Failed to save layout');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-serif text-[#646E78] mb-6">
          {currentLayout?.isLoadedLayout ? 'Update Layout' : 'Save Layout'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="layoutName" 
              className="block text-sm font-medium text-[#646E78] mb-1"
            >
              Layout Name
            </label>
            <input
              id="layoutName"
              name="layoutName"
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-[#F4E1B2] focus:outline-none focus:border-[#D3A6B8] font-serif text-[#646E78]"
              placeholder="Enter a name for your layout"
              required
              autoComplete="off"
              disabled={currentLayout?.isLoadedLayout} // Disable name editing for existing layouts
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D3A6B8] text-white py-2 px-4 rounded-lg hover:bg-[#C295A7] transition-colors font-serif"
          >
            {currentLayout?.isLoadedLayout ? 'Update Layout' : 'Save Layout'}
          </button>
        </form>
      </div>
    </div>
  );
};