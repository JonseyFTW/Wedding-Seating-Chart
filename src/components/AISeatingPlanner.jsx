import React, { useState, useCallback } from 'react';
import { Upload, Users, UserPlus, UserMinus, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import { useStore } from '../store/useStore';
import { RelationshipGraph } from './RelationshipGraph';
import { GuestList } from './GuestList';
import { BlacklistManager } from './BlacklistManager';
import { toast } from 'react-hot-toast';

export const AISeatingPlanner = () => {
  const [guests, setGuests] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentEvent, updateEvent } = useStore();

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const [headers, ...rows] = results.data;
          const validGuests = rows
            .filter(row => row[0]) // Filter out empty rows
            .map((row, index) => ({
              id: `guest-${index}`,
              name: row[0],
              email: row[1] || '',
              dietaryRestrictions: row[2] || '',
              notes: row[3] || '',
              relationships: [],
              blacklist: []
            }));
          setGuests(validGuests);
          toast.success('Guest list imported successfully!');
        },
        header: false,
        skipEmptyLines: true
      });
    }
  }, []);

  const addRelationship = useCallback((guest1Id, guest2Id) => {
    setRelationships(prev => [...prev, { source: guest1Id, target: guest2Id }]);
  }, []);

  const addToBlacklist = useCallback((guest1Id, guest2Id) => {
    setBlacklist(prev => [...prev, { source: guest1Id, target: guest2Id }]);
  }, []);

  const generateSeatingPlan = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Calculate optimal seating arrangement
      const tables = await optimizeSeating(guests, relationships, blacklist, currentEvent.tables);
      
      // Update the event with new seating arrangement
      updateEvent({
        ...currentEvent,
        tables: tables.map(table => ({
          ...table,
          guests: table.guests.map(guest => ({
            id: guest.id,
            name: guest.name,
            tableId: table.id
          }))
        }))
      });
      
      toast.success('Seating plan generated successfully!');
    } catch (error) {
      console.error('Error generating seating plan:', error);
      toast.error('Failed to generate seating plan');
    } finally {
      setIsGenerating(false);
    }
  }, [guests, relationships, blacklist, currentEvent]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-serif text-[#4A3B52] mb-6">AI Seating Planner</h2>
        
        {/* File Upload Section */}
        <div className="mb-8">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#D3A6B8] border-dashed rounded-lg cursor-pointer bg-[#FDF8F0] hover:bg-[#FCF3E6] transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-[#D3A6B8]" />
              <p className="mb-2 text-sm text-[#4A3B52]">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-[#646E78]">CSV file with guest list</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {guests.length > 0 && (
          <>
            {/* Guest Management Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-serif text-[#4A3B52] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D3A6B8]" />
                  Guest List
                </h3>
                <GuestList
                  guests={guests}
                  onUpdateGuests={setGuests}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-serif text-[#4A3B52] mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#D3A6B8]" />
                  Relationships
                </h3>
                <RelationshipGraph
                  guests={guests}
                  relationships={relationships}
                  onAddRelationship={addRelationship}
                />
              </div>
            </div>

            {/* Blacklist Section */}
            <div className="mb-8">
              <h3 className="text-lg font-serif text-[#4A3B52] mb-4 flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-[#D3A6B8]" />
                Seating Restrictions
              </h3>
              <BlacklistManager
                guests={guests}
                blacklist={blacklist}
                onAddToBlacklist={addToBlacklist}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateSeatingPlan}
              disabled={isGenerating}
              className="w-full bg-[#D3A6B8] text-white py-3 px-6 rounded-lg hover:bg-[#C295A7] transition-colors flex items-center justify-center gap-2 font-serif disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Generate Optimal Seating Plan
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};