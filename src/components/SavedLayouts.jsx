import React, { useState, useEffect } from 'react';
import { getTableLayouts, deleteTableLayout } from '../utils/tableService';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { Trash2, Clock, ArrowLeft, Folder } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SavedLayouts = ({ onBack, onSelectLayout }) => {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { setCurrentEvent } = useStore();

  useEffect(() => {
    loadLayouts();
  }, [currentUser]);

  const loadLayouts = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const userLayouts = await getTableLayouts(currentUser.uid);
      setLayouts(userLayouts.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (error) {
      toast.error('Failed to load layouts');
      console.error('Error loading layouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (layoutId) => {
    if (!window.confirm('Are you sure you want to delete this layout?')) return;

    try {
      await deleteTableLayout(layoutId);
      toast.success('Layout deleted successfully');
      await loadLayouts();
    } catch (error) {
      toast.error('Failed to delete layout');
      console.error('Error deleting layout:', error);
    }
  };

  const handleSelect = (layout) => {
    // Convert the saved layout data to match the expected format
    const formattedEvent = {
      id: layout.id,
      name: layout.name,
      tables: Array.isArray(layout.tables) ? layout.tables : [],
      furniture: Array.isArray(layout.furniture) ? layout.furniture : [],
      isLoadedLayout: true // Flag to indicate this is a loaded layout
    };
    setCurrentEvent(formattedEvent);
    onSelectLayout();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#646E78] hover:text-[#4A3B52] transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 className="text-2xl font-serif text-[#646E78]">Saved Layouts</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#646E78]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D3A6B8] mb-4"></div>
          <p>Loading layouts...</p>
        </div>
      ) : layouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#646E78]">
          <Folder className="w-16 h-16 text-[#D3A6B8] mb-4" />
          <p className="text-lg font-serif mb-2">No saved layouts yet</p>
          <p className="text-sm text-[#646E78]/80">
            Create and save a layout to see it here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#F4E1B2]/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif text-[#646E78] mb-2">
                    {layout.name}
                  </h3>
                  <p className="text-sm text-[#646E78] flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(layout.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDelete(layout.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete layout"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleSelect(layout)}
                    className="px-4 py-2 bg-[#D3A6B8] text-white rounded-lg hover:bg-[#C295A7] transition-colors font-serif"
                  >
                    Open Layout
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};