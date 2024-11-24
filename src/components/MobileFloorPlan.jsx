// src/components/MobileFloorPlan.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
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
import { RotateCcw, RotateCw, Eye, EyeOff } from 'lucide-react';

const GRID_SIZE = 20;

export const MobileFloorPlan = () => {
  const { currentEvent, updateTable, updateFurniture } = useStore();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  // Mobile-specific states
  const [showNames, setShowNames] = useState(false);
  const [rotation, setRotation] = useState(0); // Track rotation for all tables

  // State for window width to handle conditional rendering
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Update windowWidth on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Using PointerSensor, but configuring it more strictly for mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Ensure a small drag threshold before activation
      },
    })
  );

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const viewportHeight = window.innerHeight - 64; // Adjust based on the actual toolbar/header size
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

  const handleDragStart = () => {
    setDragging(true); // Indicate that a drag is in progress
  };

  // Helper function to get table dimensions based on type
  const getTableDimensions = (tableType) => {
    switch (tableType) {
      case 'round':
        return { width: 128, height: 128 }; // 'w-32 h-32' => 32 * 4px = 128px
      case '1-sided':
        return { width: 192, height: 96 }; // 'w-48 h-24' => 48*4px=192px, 24*4px=96px
      case '2-sided':
        return { width: 192, height: 128 }; // 'w-48 h-32' => 48*4px=192px, 32*4px=128px
      case '4-sided':
        return { width: 128, height: 128 }; // 'w-32 h-32' => 128px
      default:
        return { width: 128, height: 128 };
    }
  };

  const handleDragEnd = (event) => {
    setDragging(false); // Dragging ends, allow panning again
    const { active, delta } = event;
    const id = active.id;

    const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

    const table = currentEvent?.tables.find((t) => t.id === id);
    if (table) {
      const rawX = table.position.x + delta.x;
      const rawY = table.position.y + delta.y;

      // Get table dimensions
      const tableDims = getTableDimensions(table.type);

      const newX = Math.min(
        Math.max(0, snapToGrid(rawX)),
        dimensions.width - tableDims.width
      );
      const newY = Math.min(
        Math.max(0, snapToGrid(rawY)),
        dimensions.height - tableDims.height
      );

      updateTable(id, {
        position: { x: newX, y: newY },
        rotation: rotation,
      });
      return;
    }

    const furniture = currentEvent?.furniture.find((f) => f.id === id);
    if (furniture) {
      const rawX = furniture.position.x + delta.x;
      const rawY = furniture.position.y + delta.y;

      const newX = Math.min(
        Math.max(0, snapToGrid(rawX)),
        dimensions.width - furniture.size.width
      );
      const newY = Math.min(
        Math.max(0, snapToGrid(rawY)),
        dimensions.height - furniture.size.height
      );

      updateFurniture(id, { position: { x: newX, y: newY } });
    }

    // Explicitly re-apply the sensors after each drag
    resetInteractions();
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastPanRef.current = { x: distance, y: distance };
    } else if (e.touches.length === 1 && !dragging) {
      setIsPanning(true);
      lastPanRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e) => {
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
    } else if (e.touches.length === 1 && isPanning && !dragging) {
      const deltaX = e.touches[0].clientX - lastPanRef.current.x;
      const deltaY = e.touches[0].clientY - lastPanRef.current.y;
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      lastPanRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Toggle guest names visibility
  const toggleNames = () => {
    setShowNames((prev) => !prev);
  };

  // Rotate all tables clockwise or counterclockwise
  const rotateTables = (direction) => {
    setRotation(rotation + (direction === 'clockwise' ? 90 : -90));
  };

  // Helper function to reset sensors and interactions after dragging or zooming
  const resetInteractions = () => {
    setDragging(false);
    setIsPanning(false);
    lastPanRef.current = { x: 0, y: 0 };
  };

  // Create a custom modifier to adjust for scale
  const adjustScaleModifier = useMemo(() => {
    const modifier = ({ transform }) => {
      return {
        ...transform,
        x: transform.x / scale,
        y: transform.y / scale,
      };
    };
    return modifier;
  }, [scale]);

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
            modifiers={[adjustScaleModifier]} // Use the custom modifier here
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {currentEvent?.tables?.map((table, index) => (
              <Table
                key={table.id}
                table={table}
                tableNumber={index + 1}
                showNames={showNames} // Pass visibility state to each table
                rotation={rotation} // Pass rotation state to each table
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
        onZoomIn={() => {
          setScale((s) => {
            const newScale = Math.min(s + 0.1, 2);
            resetInteractions(); // Reset interactions to ensure drag is enabled afterward
            return newScale;
          });
        }}
        onZoomOut={() => {
          setScale((s) => {
            const newScale = Math.max(s - 0.1, 0.5);
            resetInteractions(); // Reset interactions to ensure drag is enabled afterward
            return newScale;
          });
        }}
        onResetView={() => {
          setScale(1);
          setPan({ x: 0, y: 0 });
          resetInteractions(); // Reset interactions to ensure drag is enabled afterward
        }}
      />
      {/* Buttons for toggling names and rotating tables, conditionally displayed */}
      {windowWidth > 768 && (
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={() => rotateTables('counterclockwise')}
            className="p-2 bg-gray-300 rounded-full"
          >
            <RotateCcw />
          </button>
          <button
            onClick={() => rotateTables('clockwise')}
            className="p-2 bg-gray-300 rounded-full"
          >
            <RotateCw />
          </button>
          <button
            onClick={toggleNames}
            className="p-2 bg-gray-300 rounded-full"
          >
            {showNames ? <EyeOff /> : <Eye />}
          </button>
        </div>
      )}
    </div>
  );
};
