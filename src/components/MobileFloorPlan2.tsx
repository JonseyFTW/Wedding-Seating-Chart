import React, { useRef, useEffect, useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Table } from './Table';
import { Furniture } from './Furniture';
import { Toolbar } from './Toolbar';
import { useStore } from '../store/useStore';

const GRID_SIZE = 20;

export const MobileFloorPlan: React.FC = () => {
  const { currentEvent, updateTable, updateFurniture } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      }
    })
  );

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const viewportHeight = window.innerHeight - 64;
        const viewportWidth = window.innerWidth;
        
        const width = Math.floor(viewportWidth / GRID_SIZE) * GRID_SIZE;
        const height = Math.floor(viewportHeight / GRID_SIZE) * GRID_SIZE;
        
        setDimensions({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize, { passive: true });
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const id = active.id as string;
    
    const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
    
    const table = currentEvent?.tables.find((t) => t.id === id);
    if (table) {
      const tableWidth = table.type === '1-sided' || table.type === '2-sided' ? 192 : 128;
      const tableHeight = table.type === '2-sided' ? 128 : table.type === '1-sided' ? 96 : 128;
      
      const rawX = table.position.x + delta.x / scale;
      const rawY = table.position.y + delta.y / scale;
      
      const maxX = dimensions.width - tableWidth;
      const maxY = dimensions.height - tableHeight;
      
      const newX = Math.min(Math.max(0, snapToGrid(rawX)), maxX);
      const newY = Math.min(Math.max(0, snapToGrid(rawY)), maxY);
      
      updateTable(id, {
        position: { x: newX, y: newY },
      });
      return;
    }

    const furniture = currentEvent?.furniture?.find((f) => f.id === id);
    if (furniture) {
      const maxX = dimensions.width - furniture.size.width;
      const maxY = dimensions.height - furniture.size.height;
      
      const newX = Math.min(Math.max(0, snapToGrid(furniture.position.x + delta.x / scale)), maxX);
      const newY = Math.min(Math.max(0, snapToGrid(furniture.position.y + delta.y / scale)), maxY);
      
      updateFurniture(id, {
        position: { x: newX, y: newY },
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastPanRef.current = { x: distance, y: distance };
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      lastPanRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const delta = distance - lastPanRef.current.x;
      const newScale = Math.min(Math.max(0.5, scale + delta * 0.01), 2);
      setScale(newScale);
      lastPanRef.current = { x: distance, y: distance };
    } else if (e.touches.length === 1 && isPanning) {
      const deltaX = e.touches[0].clientX - lastPanRef.current.x;
      const deltaY = e.touches[0].clientY - lastPanRef.current.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      lastPanRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        id="floor-plan" 
        className="bg-white rounded-lg shadow-lg relative touch-none overflow-hidden"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            backgroundImage: showGrid
              ? 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)'
              : 'none',
          }}
        >
          <DndContext 
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            {currentEvent?.tables?.map((table, index) => (
              <Table 
                key={table.id} 
                table={table} 
                tableNumber={index + 1}
              />
            ))}
            {currentEvent?.furniture?.map((item) => (
              <Furniture key={item.id} item={item} />
            ))}
          </DndContext>
        </div>
      </div>
      <Toolbar 
        onToggleGrid={() => setShowGrid(!showGrid)} 
        showGrid={showGrid}
        onZoomIn={() => setScale(s => Math.min(s + 0.1, 2))}
        onZoomOut={() => setScale(s => Math.max(s - 0.1, 0.5))}
        onResetView={() => {
          setScale(1);
          setPan({ x: 0, y: 0 });
        }}
      />
    </div>
  );
};