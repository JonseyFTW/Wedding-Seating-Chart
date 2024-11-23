import React, { useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Music2, GlassWater, Camera, Gift, Cake, ArrowUpRight, Users, RotateCw, RotateCcw, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const MIN_SIZE = 40;
const MAX_SIZE = 400;
const SIZE_STEP = 20;

export const Furniture = ({ item }) => {
  const { updateFurniture, currentEvent, setCurrentEvent } = useStore();
  const [localRotation, setLocalRotation] = useState(item.rotation || 0);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: item,
  });

  const draggableStyle = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${localRotation}deg)`
      : `rotate(${localRotation}deg)`,
    zIndex: 1,
    width: `${item.size.width}px`,
    height: `${item.size.height}px`,
  };

  const style = {
    position: 'absolute',
    left: `${item.position.x}px`,
    top: `${item.position.y}px`,
    touchAction: 'none',
    pointerEvents: 'auto',
  };

  const handleRotate = useCallback(
    (direction, e) => {
      e.preventDefault();
      e.stopPropagation();
      const newRotation = localRotation + (direction === 'clockwise' ? 90 : -90);
      setLocalRotation(newRotation);
      updateFurniture(item.id, { rotation: newRotation });
    },
    [localRotation, item.id, updateFurniture]
  );

  const handleResize = useCallback(
    (dimension, increase, e) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = increase ? SIZE_STEP : -SIZE_STEP;
      const currentSize = item.size[dimension];
      const newSize = Math.min(Math.max(MIN_SIZE, currentSize + delta), MAX_SIZE);

      updateFurniture(item.id, {
        size: {
          ...item.size,
          [dimension]: newSize,
        },
      });
    },
    [item.id, item.size, updateFurniture]
  );

  const handleDelete = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!currentEvent) return;

      if (window.confirm('Are you sure you want to delete this item?')) {
        const updatedFurniture = currentEvent.furniture.filter((f) => f.id !== item.id);
        setCurrentEvent({
          ...currentEvent,
          furniture: updatedFurniture,
        });
      }
    },
    [currentEvent, item.id, setCurrentEvent]
  );

  const getIcon = () => {
    const iconProps = {
      className: `w-6 h-6 ${item.size.width < 80 || item.size.height < 80 ? 'scale-75' : ''}`,
    };

    switch (item.type) {
      case 'danceFloor':
        return <Users {...iconProps} />;
      case 'bar':
        return <GlassWater {...iconProps} />;
      case 'photoBooth':
        return <Camera {...iconProps} />;
      case 'dj':
        return <Music2 {...iconProps} />;
      case 'giftTable':
        return <Gift {...iconProps} />;
      case 'cakeTable':
        return <Cake {...iconProps} />;
      case 'entrance':
        return <ArrowUpRight {...iconProps} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (item.type) {
      case 'danceFloor':
        return 'Dance Floor';
      case 'bar':
        return 'Bar';
      case 'photoBooth':
        return 'Photo Booth';
      case 'dj':
        return 'DJ Booth';
      case 'giftTable':
        return 'Gift Table';
      case 'cakeTable':
        return 'Cake Table';
      case 'entrance':
        return 'Entrance';
      default:
        return '';
    }
  };

  const getFurnitureContentClasses = () => {
    return 'bg-white/90 border-2 border-[#D3A6B8] rounded-lg shadow-lg select-none flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing';
  };

  return (
    <div className="relative group" style={style}>
      {/* Controls positioned at the top */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center gap-1 bg-[#F4E1B2] rounded-full px-2 py-1 shadow-md border border-[#E5C594]">
          <button
            onClick={(e) => handleRotate('counterclockwise', e)}
            className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
            type="button"
            title="Rotate counterclockwise"
          >
            <RotateCcw className="w-4 h-4 text-[#646E78]" />
          </button>
          <button
            onClick={(e) => handleRotate('clockwise', e)}
            className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
            type="button"
            title="Rotate clockwise"
          >
            <RotateCw className="w-4 h-4 text-[#646E78]" />
          </button>
          <button
            onClick={(e) => handleResize('width', true, e)}
            className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
            type="button"
            title="Increase width"
            disabled={item.size.width >= MAX_SIZE}
          >
            <Maximize2 className="w-4 h-4 text-[#646E78] rotate-90" />
          </button>
          <button
            onClick={(e) => handleResize('width', false, e)}
            className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
            type="button"
            title="Decrease width"
            disabled={item.size.width <= MIN_SIZE}
          >
            <Minimize2 className="w-4 h-4 text-[#646E78] rotate-90" />
          </button>
          <button
            onClick={(e) => handleResize('height', true, e)}
            className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
            type="button"
            title="Increase height"
            disabled={item.size.height >= MAX_SIZE}
          >
            <Maximize2 className="w-4 h-4 text-[#646E78] rotate-90" />
          </button>
          <button
            onClick={(e) => handleResize('height', false, e)}
            className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
            type="button"
            title="Decrease height"
            disabled={item.size.height <= MIN_SIZE}
          >
            <Minimize2 className="w-4 h-4 text-[#646E78] rotate-90" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-[#E5C594] rounded-full active:bg-[#D3A6B8]"
            type="button"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Furniture container with rotation applied */}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={draggableStyle}
        className={getFurnitureContentClasses()}
      >
        {getIcon()}
        <span className="text-sm font-medium text-center px-2">{getLabel()}</span>
      </div>
    </div>
  );
};
