import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Users, 
  UserPlus, 
  UserMinus, 
  RefreshCw, 
  ArrowLeft, 
  Check, 
  Plus 
} from 'lucide-react';
import { parse } from 'papaparse';
import { useStore } from '../store/useStore';
import { RelationshipGraph } from './RelationshipGraph';
import { GuestList } from './GuestList';
import { BlacklistManager } from './BlacklistManager';
import { optimizeSeating } from '../utils/seatingOptimizer';
import { RELATIONSHIP_TYPES, SEATING_PREFERENCES } from '../utils/constants';
import { toast } from 'react-hot-toast';

// Define Quick Rules
const QUICK_RULES = [
  {
    id: 'lastNameFamily',
    label: 'Auto-assign family relationships for matching last names',
    apply: (guests, addRelationship) => {
      const lastNameGroups = {};
      
      // Group guests by last name
      guests.forEach(guest => {
        const lastName = guest.name.split(' ').slice(-1)[0];
        if (!lastNameGroups[lastName]) {
          lastNameGroups[lastName] = [];
        }
        lastNameGroups[lastName].push(guest);
      });

      // Create family relationships for matching last names
      Object.values(lastNameGroups).forEach(group => {
        if (group.length > 1) {
          for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
              addRelationship(group[i].id, group[j].id, RELATIONSHIP_TYPES.FAMILY.value);
            }
          }
        }
      });
    }
  },
  {
    id: 'couples',
    label: 'Auto-detect couples (Mr. & Mrs., same last name)',
    apply: (guests, addRelationship) => {
      const potentialCouples = [];
      
      guests.forEach((guest1, i) => {
        const [title1, ...name1Parts] = guest1.name.split(' ');
        const lastName1 = name1Parts[name1Parts.length - 1];
        
        guests.slice(i + 1).forEach(guest2 => {
          const [title2, ...name2Parts] = guest2.name.split(' ');
          const lastName2 = name2Parts[name2Parts.length - 1];
          
          if (lastName1 === lastName2 && 
              ((title1 === 'Mr.' && title2 === 'Mrs.') || 
               (title1 === 'Mr.' && title2 === 'Ms.'))) {
            potentialCouples.push([guest1, guest2]);
          }
        });
      });

      potentialCouples.forEach(([guest1, guest2]) => {
        addRelationship(guest1.id, guest2.id, RELATIONSHIP_TYPES.SIGNIFICANT_OTHER.value);
      });
    }
  },
  {
    id: 'sameTable',
    label: 'Keep guests from same table in previous layout together',
    apply: (guests, addRelationship, currentEvent) => {
      if (!currentEvent?.tables) return;
      
      currentEvent.tables.forEach(table => {
        const tableGuests = table.guests.filter(g => g.name);
        
        for (let i = 0; i < tableGuests.length; i++) {
          for (let j = i + 1; j < tableGuests.length; j++) {
            const guest1 = guests.find(g => g.name === tableGuests[i].name);
            const guest2 = guests.find(g => g.name === tableGuests[j].name);
            
            if (guest1 && guest2) {
              addRelationship(guest1.id, guest2.id, RELATIONSHIP_TYPES.FRIEND.value);
            }
          }
        }
      });
    }
  }
];

export const AISeatingPlanner = ({ onBack }) => {
  const { currentEvent, updateEventWithAISeating, updateAIPlannerData } = useStore();
  const [guests, setGuests] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [seatingPreference, setSeatingPreference] = useState(SEATING_PREFERENCES.BALANCED.value);
  
  // New state for applied rules
  const [appliedRules, setAppliedRules] = useState(new Set());

  // Load saved AI Planner data when component mounts
  useEffect(() => {
    if (currentEvent?.aiPlannerData) {
      setGuests(currentEvent.aiPlannerData.guests || []);
      setRelationships(currentEvent.aiPlannerData.relationships || []);
      setBlacklist(currentEvent.aiPlannerData.blacklist || []);
    }
  }, [currentEvent]);

  // Save AI Planner data whenever it changes
  useEffect(() => {
    if (guests.length > 0 || relationships.length > 0 || blacklist.length > 0) {
      updateAIPlannerData({
        guests,
        relationships,
        blacklist
      });
    }
  }, [guests, relationships, blacklist, updateAIPlannerData]);

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
    setRelationships(prev => {
      // Avoid duplicate relationships
      const exists = prev.some(rel => 
        (rel.source === guest1Id && rel.target === guest2Id) ||
        (rel.source === guest2Id && rel.target === guest1Id)
      );
      if (exists) return prev;
      return [...prev, { 
        source: guest1Id, 
        target: guest2Id, 
        type: relationshipType || RELATIONSHIP_TYPES.FRIEND.value 
      }];
    });
    setSelectedGuest(null);
  }, []);

  const removeRelationship = useCallback((guest1Id, guest2Id) => {
    setRelationships(prev => prev.filter(
      rel => !(rel.source === guest1Id && rel.target === guest2Id) &&
            !(rel.source === guest2Id && rel.target === guest1Id)
    ));
  }, []);

  const addToBlacklist = useCallback((guest1Id, guest2Id) => {
    setBlacklist(prev => {
      // Avoid duplicate blacklist entries
      const exists = prev.some(rel => 
        (rel.source === guest1Id && rel.target === guest2Id) ||
        (rel.source === guest2Id && rel.target === guest1Id)
      );
      if (exists) return prev;
      return [...prev, { source: guest1Id, target: guest2Id }];
    });
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

  // New function to handle applying quick rules
  const handleApplyRule = useCallback((ruleId) => {
    const rule = QUICK_RULES.find(r => r.id === ruleId);
    if (rule) {
      rule.apply(guests, addRelationship, currentEvent);
      setAppliedRules(prev => new Set([...prev, ruleId]));
      toast.success(`Applied rule: ${rule.label}`);
    }
  }, [guests, addRelationship, currentEvent]);

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
              {/* Quick Rules Section */}
              <div className="mb-8">
                <h3 className="text-lg font-serif text-[#4A3B52] mb-4">Quick Rules</h3>
                <div className="space-y-3">
                  {QUICK_RULES.map(rule => (
                    <button
                      key={rule.id}
                      onClick={() => handleApplyRule(rule.id)}
                      disabled={appliedRules.has(rule.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                        appliedRules.has(rule.id)
                          ? 'bg-[#F4E1B2]/20 border-[#D3A6B8]/20 text-[#646E78]'
                          : 'bg-white border-[#D3A6B8]/20 text-[#4A3B52] hover:bg-[#FDF8F0]'
                      }`}
                    >
                      {appliedRules.has(rule.id) ? (
                        <Check className="w-5 h-5 text-[#D3A6B8]" />
                      ) : (
                        <Plus className="w-5 h-5 text-[#D3A6B8]" />
                      )}
                      <span className="text-sm">{rule.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Management Section */}

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="md:col-span-1">
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
                
                <div className="md:col-span-1">
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
