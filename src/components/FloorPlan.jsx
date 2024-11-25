// FloorPlan.jsx

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
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });

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
        // Adjust for both headers (104px) and padding
        const viewportHeight = window.innerHeight - 104 - 32;
        const viewportWidth = window.innerWidth - 48;
        setDimensions({
          width: viewportWidth,
          height: viewportHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle Wheel for Zooming
  const handleWheel = (e) => {
    e.preventDefault(); // Prevent default scrolling
    const delta = e.deltaY;
    setScale((prevScale) => {
      const newScale = prevScale - delta * 0.001;
      return Math.min(Math.max(newScale, 0.5), 3); // Restrict zoom between 50% and 300%
    });
  };

  // Handle Mouse Down for Panning
  const handleMouseDown = (e) => {
    if (e.target === containerRef.current) {
      setIsPanning(true);
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle Mouse Move for Panning
  const handleMouseMove = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPosition.x;
      const deltaY = e.clientY - lastPanPosition.y;
      setPan((prevPan) => ({
        x: prevPan.x + deltaX,
        y: prevPan.y + deltaY,
      }));
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle Mouse Up to Stop Panning
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle Drag Start to Differentiate from Panning
  const handleDragStart = () => {
    setIsDragging(true);
    setIsPanning(false); // Prevent conflict with panning
  };

  // Handle Drag End to Update Positions
  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const id = active.id;
    setIsDragging(false);

    // Calculate new position without snapping
    const newX = active.data.current.position.x + delta.x / scale;
    const newY = active.data.current.position.y + delta.y / scale;

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

      // Calculate maximum allowed positions
      const maxX = dimensions.width / scale - tableWidth;
      const maxY = dimensions.height / scale - tableHeight;

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
      const newX = furniture.position.x + delta.x / scale;
      const newY = furniture.position.y + delta.y / scale;

      const maxX = dimensions.width / scale - furniture.size.width;
      const maxY = dimensions.height / scale - furniture.size.height;

      updateFurniture(id, {
        position: {
          x: Math.min(Math.max(0, newX), maxX),
          y: Math.min(Math.max(0, newY), maxY),
        },
      });
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-[#FDF8F0] to-[#FCF3E6]"
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={containerRef}
        id="floor-plan"
        className="bg-[#FFF9F0] rounded-lg shadow-lg relative overflow-hidden"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={handleMouseDown}
      >
<div
  className="inner-scale-wrapper"
  style={{
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
    transformOrigin: '0 0',
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    backgroundSize: `${GRID_SIZE / scale}px ${GRID_SIZE / scale}px`, // Dynamically adjust grid size
    backgroundImage: showGrid
      ? `
        linear-gradient(to right, rgba(211, 166, 184, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(211, 166, 184, 0.1) 1px, transparent 1px)
      `
      : 'none',
    backgroundRepeat: 'repeat',
    backgroundPosition: `${-pan.x / scale}px ${-pan.y / scale}px`, // Ensure grid stays aligned while panning
  }}
>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {currentEvent?.tables.map((table, index) => (
              <Table key={table.id} table={table} tableNumber={index + 1} />
            ))}
            {currentEvent?.furniture?.map((item) => (
              <Furniture key={item.id} item={item} />
            ))}
          </DndContext>
        </div>
      </div>
      <Toolbar onToggleGrid={() => setShowGrid(!showGrid)} showGrid={showGrid} />
    </div>
  );
};
