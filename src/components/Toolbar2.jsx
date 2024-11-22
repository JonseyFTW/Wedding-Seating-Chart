// src/components/Toolbar.jsx
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Download,
  Mail,
  Plus,
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Users,
  GlassWater,
  Camera,
  Music2,
  Gift,
  Cake,
  ArrowUpRight,
} from 'lucide-react'; // Import all necessary icons directly
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateUUID } from '../utils/uuid';

const furnitureTypes = [
  {
    type: 'danceFloor',
    label: 'Dance Floor',
    icon: Users, // Assign imported icon directly
    width: 200,
    height: 200,
  },
  {
    type: 'bar',
    label: 'Bar',
    icon: GlassWater, // Assign imported icon directly
    width: 150,
    height: 50,
  },
  {
    type: 'photoBooth',
    label: 'Photo Booth',
    icon: Camera, // Assign imported icon directly
    width: 80,
    height: 80,
  },
  {
    type: 'dj',
    label: 'DJ Booth',
    icon: Music2, // Assign imported icon directly
    width: 80,
    height: 40,
  },
  {
    type: 'giftTable',
    label: 'Gift Table',
    icon: Gift, // Assign imported icon directly
    width: 100,
    height: 40,
  },
  {
    type: 'cakeTable',
    label: 'Cake Table',
    icon: Cake, // Assign imported icon directly
    width: 80,
    height: 40,
  },
  {
    type: 'entrance',
    label: 'Entrance',
    icon: ArrowUpRight, // Assign imported icon directly
    width: 60,
    height: 20,
  },
];

export const Toolbar = ({
  onToggleGrid,
  showGrid,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
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

  const exportToPDF = async () => {
    const element = document.getElementById('floor-plan');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${currentEvent?.name}-seating-chart.pdf`);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Seating Chart - ${currentEvent?.name}`);
    const body = encodeURIComponent(
      'Please find attached the seating chart for the event.'
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed top-20 right-4 flex flex-col gap-2 z-50">
      {/* Furniture Add Button */}
      <div className="relative">
        <button
          onClick={() => setShowFurnitureMenu(!showFurnitureMenu)}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100"
          title="Add Furniture"
          type="button"
        >
          <Plus className="w-5 h-5" />
        </button>

        {showFurnitureMenu && (
          <div className="absolute right-full mr-2 mt-0 w-48 bg-white rounded-lg shadow-lg py-2">
            {furnitureTypes.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleAddFurniture(type)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                type="button"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toggle Grid Button */}
      <button
        onClick={onToggleGrid}
        className={`bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100 ${
          showGrid ? 'text-blue-600' : ''
        }`}
        title="Toggle Grid"
        type="button"
      >
        <Grid className="w-5 h-5" />
      </button>

      {/* Zoom In Button */}
      {onZoomIn && (
        <button
          onClick={onZoomIn}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100"
          title="Zoom In"
          type="button"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      )}

      {/* Zoom Out Button */}
      {onZoomOut && (
        <button
          onClick={onZoomOut}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100"
          title="Zoom Out"
          type="button"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      )}

      {/* Reset View Button */}
      {onResetView && (
        <button
          onClick={onResetView}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100"
          title="Reset View"
          type="button"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      )}

      {/* Export to PDF Button */}
      <button
        onClick={exportToPDF}
        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100"
        title="Export to PDF"
        type="button"
      >
        <Download className="w-5 h-5" />
      </button>

      {/* Share via Email Button */}
      <button
        onClick={shareViaEmail}
        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100"
        title="Share via Email"
        type="button"
      >
        <Mail className="w-5 h-5" />
      </button>
    </div>
  );
};
