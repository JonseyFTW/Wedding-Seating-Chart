import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateUUID } from '../utils/uuid';

const furnitureTypes = [
  {
    type: 'danceFloor',
    label: 'Dance Floor',
    width: 200,
    height: 200,
  },
  {
    type: 'bar',
    label: 'Bar',
    width: 150,
    height: 50,
  },
  {
    type: 'photoBooth',
    label: 'Photo Booth',
    width: 80,
    height: 80,
  },
  {
    type: 'dj',
    label: 'DJ Booth',
    width: 80,
    height: 40,
  },
  {
    type: 'giftTable',
    label: 'Gift Table',
    width: 100,
    height: 40,
  },
  {
    type: 'cakeTable',
    label: 'Cake Table',
    width: 80,
    height: 40,
  },
  {
    type: 'entrance',
    label: 'Entrance',
    width: 60,
    height: 20,
  },
];

export const Toolbar = () => {
  const { currentEvent, addFurniture } = useStore();
  const [showFurnitureMenu, setShowFurnitureMenu] = useState(false);

  const handleAddFurniture = (type) => {
    const furnitureConfig = furnitureTypes.find((f) => f.type === type);
    if (!furnitureConfig || !currentEvent) return;

    addFurniture({
      id: generateUUID(),
      type,
      position: { x: 100, y: 100 },
      rotation: 0,
      size: {
        width: furnitureConfig.width,
        height: furnitureConfig.height,
      },
    });
    setShowFurnitureMenu(false);
  };

  return (
    <div className="fixed right-6 top-[130px] z-20">
      <div className="relative">
        <button
          onClick={() => setShowFurnitureMenu(!showFurnitureMenu)}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D3A6B8]/20"
          title="Add Furniture"
        >
          <Plus className="w-6 h-6 text-[#D3A6B8]" />
        </button>

        {showFurnitureMenu && (
          <div className="absolute right-full mr-2 mt-0 w-48 bg-white rounded-lg shadow-lg py-2">
            {furnitureTypes.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => handleAddFurniture(type)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                type="button"
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};