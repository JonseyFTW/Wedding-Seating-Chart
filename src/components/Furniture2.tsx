import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Furniture as FurnitureType } from '../types';
import { Music2, GlassWater, Camera, Gift, Cake, ArrowUpRight, Users, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { useStore } from '../store/useStore';

interface FurnitureProps {
  item: FurnitureType;
}

const MIN_SIZE = 40;
const MAX_SIZE = 400;
const SIZE_STEP = 20;

export const Furniture: React.FC<FurnitureProps> = ({ item }) => {
  const { updateFurniture } = useStore();
  const [rotation, setRotation] = React.useState(item.rotation || 0);
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: item
  });

  const style: React.CSSProperties = transform ? {
    transform: `translate3d(${item.position.x + transform.x}px, ${item.position.y + transform.y}px, 0) rotate(${rotation}deg)`,
    position: 'absolute',
    width: item.size.width,
    height: item.size.height,
    touchAction: 'none'
  } : {
    transform: `translate3d(${item.position.x}px, ${item.position.y}px, 0) rotate(${rotation}deg)`,
    position: 'absolute',
    width: item.size.width,
    height: item.size.height,
    touchAction: 'none'
  };

  const handleRotate = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    updateFurniture(item.id, { rotation: newRotation });
  }, [rotation, item.id, updateFurniture]);

  const handleResize = React.useCallback((dimension: 'width' | 'height', increase: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = increase ? SIZE_STEP : -SIZE_STEP;
    const currentSize = item.size[dimension];
    const newSize = Math.min(Math.max(MIN_SIZE, currentSize + delta), MAX_SIZE);
    
    updateFurniture(item.id, {
      size: {
        ...item.size,
        [dimension]: newSize
      }
    });
  }, [item.id, item.size, updateFurniture]);

  const getIcon = () => {
    const iconProps = {
      className: `w-6 h-6 ${item.size.width < 80 || item.size.height < 80 ? 'scale-75' : ''}`
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

  return (
    <div
      style={style}
      className="bg-white/90 border-2 border-gray-200 rounded-lg shadow-lg select-none group"
    >
      {/* Controls positioned at the top */}
      <div 
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-md border border-gray-100">
          <button
            onClick={handleRotate}
            className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleResize('width', true, e)}
            className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            title="Increase width"
            disabled={item.size.width >= MAX_SIZE}
          >
            <Maximize2 className="w-4 h-4 rotate-90" />
          </button>
          <button
            onClick={(e) => handleResize('width', false, e)}
            className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            title="Decrease width"
            disabled={item.size.width <= MIN_SIZE}
          >
            <Minimize2 className="w-4 h-4 rotate-90" />
          </button>
          <button
            onClick={(e) => handleResize('height', true, e)}
            className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            title="Increase height"
            disabled={item.size.height >= MAX_SIZE}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleResize('height', false, e)}
            className="p-1 hover:bg-gray-100 rounded-full active:bg-gray-200"
            type="button"
            title="Decrease height"
            disabled={item.size.height <= MIN_SIZE}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Draggable area with content */}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing"
      >
        {getIcon()}
        <span className="text-sm font-medium text-center px-2">{getLabel()}</span>
      </div>
    </div>
  );
};