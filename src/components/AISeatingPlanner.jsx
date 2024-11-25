import React, { useState, useCallback } from 'react';
import { Upload, Users, UserPlus, UserMinus, RefreshCw, ArrowLeft } from 'lucide-react';
import { parse } from 'papaparse';
import { useStore } from '../store/useStore';
import { RelationshipGraph } from './RelationshipGraph';
import { GuestList } from './GuestList';
import { BlacklistManager } from './BlacklistManager';
import { optimizeSeating } from '../utils/seatingOptimizer.js';
import { RELATIONSHIP_TYPES, SEATING_PREFERENCES } from '../utils/constants';
import { toast } from 'react-hot-toast';

export const AISeatingPlanner = ({ onBack }) => {
  const [guests, setGuests] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [seatingPreference, setSeatingPreference] = useState(SEATING_PREFERENCES.BALANCED.value);
  const { currentEvent, updateEventWithAISeating } = useStore();

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      parse(file, {
        complete: (results) => {
          const [headers, ...rows] = results.data;
          const validGuests = rows
            .filter(row => row[0])
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

  const addRelationship = useCallback((guest1Id, guest2Id, relationshipType) => {
    setRelationships(prev => [...prev, { 
      source: guest1Id, 
      target: guest2Id, 
      type: relationshipType || RELATIONSHIP_TYPES.FRIEND.value 
    }]);
    setSelectedGuest(null);
  }, []);

  const removeRelationship = useCallback((guest1Id, guest2Id) => {
    setRelationships(prev => prev.filter(
      rel => !(rel.source === guest1Id && rel.target === guest2Id) &&
            !(rel.source === guest2Id && rel.target === guest1Id)
    ));
  }, []);

  const addToBlacklist = useCallback((guest1Id, guest2Id) => {
    setBlacklist(prev => [...prev, { source: guest1Id, target: guest2Id }]);
    setSelectedGuest(null);
  }, []);

  const removeFromBlacklist = useCallback((guest1Id, guest2Id) => {
    setBlacklist(prev => prev.filter(
      rel => !(rel.source === guest1Id && rel.target === guest2Id) &&
            !(rel.source === guest2Id && rel.target === guest1Id)
    ));
  }, []);

  const handleGuestSelect = useCallback((guest) => {
    setSelectedGuest(selectedGuest?.id === guest.id ? null : guest);
  }, [selectedGuest]);

  const handleRelationshipAdd = useCallback((targetGuest, relationshipType) => {
    if (selectedGuest && targetGuest.id !== selectedGuest.id) {
      addRelationship(selectedGuest.id, targetGuest.id, relationshipType);
    }
  }, [selectedGuest, addRelationship]);

  const generateSeatingPlan = useCallback(async () => {
    if (!currentEvent?.tables?.length) {
      toast.error('Please create tables first');
      return;
    }

    setIsGenerating(true);
    try {
      const optimizedTables = await optimizeSeating(
        guests, 
        relationships, 
        blacklist, 
        currentEvent.tables,
        seatingPreference
      );
      
      updateEventWithAISeating(optimizedTables);
      toast.success('Seating plan generated successfully!');
      onBack();
    } catch (error) {
      console.error('Error generating seating plan:', error);
      toast.error('Failed to generate seating plan');
    } finally {
      setIsGenerating(false);
    }
  }, [guests, relationships, blacklist, currentEvent, seatingPreference, updateEventWithAISeating, onBack]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 text-sm border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-[#D3A6B8]" />
            Back to Layout
          </button>
        </div>

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
                    relationships={relationships}
                    onAddRelationship={addRelationship}
                    onRemoveRelationship={removeRelationship}
                    blacklist={blacklist}
                    onAddToBlacklist={addToBlacklist}
                    onRemoveFromBlacklist={removeFromBlacklist}
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
                    onRemoveRelationship={removeRelationship}
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
                  onRemoveFromBlacklist={removeFromBlacklist}
                />
              </div>

              {/* Seating Preference */}
              <div className="mb-8">
                <h3 className="text-lg font-serif text-[#4A3B52] mb-4">
                  Seating Preference
                </h3>
                <select
                  value={seatingPreference}
                  onChange={(e) => setSeatingPreference(e.target.value)}
                  className="w-full rounded-lg border-[#D3A6B8]/20 focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20 p-2"
                >
                  {Object.values(SEATING_PREFERENCES).map(pref => (
                    <option key={pref.value} value={pref.value}>
                      {pref.label}
                    </option>
                  ))}
                </select>
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
    </div>
  );
};
