// src/components/FloorPlan.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { Table } from './Table';
import { Furniture } from './Furniture';
import { Toolbar } from './Toolbar';
import { useStore } from '../store/useStore';

const GRID_SIZE = 20;

export const FloorPlan = () => {
  const { currentEvent, updateTable, updateFurniture } = useStore();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 0,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const viewportHeight = window.innerHeight - 80;
        const viewportWidth = window.innerWidth - 48;
        const width = Math.floor(viewportWidth / GRID_SIZE) * GRID_SIZE;
        const height = Math.floor(viewportHeight / GRID_SIZE) * GRID_SIZE;
        setDimensions({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleDragStart = (event) => {
    setIsDragging(true);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const id = active.id;
    setIsDragging(false);

    const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

    const table = currentEvent?.tables.find((t) => t.id === id);
    if (table) {
      const tableWidth =
        table.type === '1-sided' || table.type === '2-sided' ? 192 : 128;
      const tableHeight =
        table.type === '2-sided'
          ? 128
          : table.type === '1-sided'
          ? 96
          : 128;

      const maxX = dimensions.width - tableWidth;
      const maxY = dimensions.height - tableHeight;

      const newX = snapToGrid(table.position.x + delta.x);
      const newY = snapToGrid(table.position.y + delta.y);

      updateTable(id, {
        position: {
          x: Math.min(Math.max(0, newX), maxX),
          y: Math.min(Math.max(0, newY), maxY),
        },
      });
      return;
    }

    const furniture = currentEvent?.furniture?.find((f) => f.id === id);
    if (furniture) {
      const maxX = dimensions.width - furniture.size.width;
      const maxY = dimensions.height - furniture.size.height;

      const newX = snapToGrid(furniture.position.x + delta.x);
      const newY = snapToGrid(furniture.position.y + delta.y);

      updateFurniture(id, {
        position: {
          x: Math.min(Math.max(0, newX), maxX),
          y: Math.min(Math.max(0, newY), maxY),
        },
      });
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-[#FDF8F0] to-[#FCF3E6]">
      <div
        ref={containerRef}
        id="floor-plan"
        className="bg-[#FFF9F0] rounded-lg shadow-lg relative"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundImage: showGrid
            ? 'linear-gradient(to right, rgba(211, 166, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(211, 166, 184, 0.1) 1px, transparent 1px)'
            : 'none',
          cursor: isDragging ? 'grabbing' : 'default',
          boxShadow: '0 4px 20px rgba(211, 166, 184, 0.15)',
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {currentEvent?.tables.map((table, index) => (
            <Table
              key={table.id}
              table={table}
              tableNumber={index + 1}
              showNames={true}
            />
          ))}
          {currentEvent?.furniture?.map((item) => (
            <Furniture key={item.id} item={item} />
          ))}
        </DndContext>
      </div>
      <Toolbar onToggleGrid={() => setShowGrid(!showGrid)} showGrid={showGrid} />
    </div>
  );
};
