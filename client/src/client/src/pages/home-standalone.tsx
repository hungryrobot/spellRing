import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Search, BookOpen, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLocation } from "wouter";
import SpellCard from "@/components/spell-card";
import CapacityIndicator from "@/components/capacity-indicator";
import { ALL_SPELLS } from "@/data/spells";

// Types for local storage
interface StoredSpell {
  id: number;
  name: string;
  class: string;
  level: number;
  description: string;
  spell: string;
  type: string;
  concentration: string;
  upcast: string;
  range: string;
}

interface RingSpell {
  id: number;
  spellId: number;
  upcastLevel: number;
  addedAt: string;
  spell: StoredSpell;
}

export default function HomeStandalone() {
  const [classFilter, setClassFilter] = useState<string>("Wizard");
  const [levelFilter, setLevelFilter] = useState<string>("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Local storage for ring spells
  const [ringStorage, setRingStorage] = useLocalStorage<RingSpell[]>("dnd-ring-storage", []);
  
  // Convert imported spells to include IDs
  const spells: StoredSpell[] = useMemo(() => 
    ALL_SPELLS.map((spell, index) => ({
      id: index + 1,
      ...spell
    })), []
  );

  // Add spell to ring
  const handleAddSpell = (spell: StoredSpell, upcastLevel: number = 0) => {
    // Check capacity
    const currentCapacity = ringStorage.reduce((sum, item) => {
      const baseLevel = item.spell.level === 0 ? 1 : item.spell.level;
      return sum + (baseLevel + item.upcastLevel);
    }, 0);
    
    const effectiveLevel = (spell.level === 0 ? 1 : spell.level) + upcastLevel;
    if (currentCapacity + effectiveLevel > 5) {
      toast({
        title: "Cannot Add Spell",
        description: `Ring capacity exceeded. Current: ${currentCapacity}/5, Effective spell level: ${effectiveLevel}`,
        variant: "destructive",
      });
      return;
    }

    // Play add sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Audio not supported");
    }

    const newRingSpell: RingSpell = {
      id: Date.now(), // Simple ID generation
      spellId: spell.id,
      upcastLevel,
      addedAt: new Date().toISOString(),
      spell
    };

    setRingStorage(prev => [...prev, newRingSpell]);
    toast({
      title: "Spell Added",
      description: "Spell has been added to your ring",
    });
  };

  // Remove spell from ring
  const handleRemoveSpell = (ringId: number) => {
    // Play cast sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
      oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5); // A2
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Audio not supported");
    }

    setRingStorage(prev => prev.filter(item => item.id !== ringId));
    toast({
      title: "Spell Cast",
      description: "Spell has been cast and removed from your ring",
    });
  };

  // Calculate current capacity
  const currentCapacity = useMemo(() => {
    return ringStorage.reduce((sum, item) => {
      const baseLevel = item.spell.level === 0 ? 1 : item.spell.level;
      return sum + (baseLevel + item.upcastLevel);
    }, 0);
  }, [ringStorage]);

  // Get available spell levels
  const availableLevels = useMemo(() => {
    const levels = [...new Set(spells.map(spell => spell.level))].sort((a, b) => a - b);
    return levels;
  }, [spells]);

  // Get available classes
  const availableClasses = useMemo(() => {
    const classes = [...new Set(spells.map(spell => spell.class))].sort();
    return classes;
  }, [spells]);

  // Filter spells
  const filteredSpells = useMemo(() => {
    return spells.filter((spell: StoredSpell) => {
      const matchesClass = classFilter === "all" || spell.class === classFilter;
      const matchesLevel = levelFilter === "all" || spell.level.toString() === levelFilter;
      const matchesSearch = searchTerm === "" || 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesClass && matchesLevel && matchesSearch;
    });
  }, [spells, classFilter, levelFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Ring Storage */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                  Ring of Spell Storing
                </CardTitle>
                <p className="text-gray-600">
                  {currentCapacity} levels stored • {5 - currentCapacity} levels remaining
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <CapacityIndicator current={currentCapacity} max={5} />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation("/setup")}
                  className="hidden sm:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Setup
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {ringStorage.length > 0 && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ringStorage.map((item) => (
                  <SpellCard
                    key={item.id}
                    spell={item.spell}
                    variant="ring"
                    onRemove={handleRemoveSpell}
                    ringId={item.id}
                    upcastLevel={item.upcastLevel}
                  />
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Spell Library */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Spell Library
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredSpells.length} spells)
                </span>
              </CardTitle>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <Label htmlFor="search">Search Spells</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="class-filter">Class</Label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level-filter">Level</Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {availableLevels.map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level === 0 ? "Cantrip" : `Level ${level}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setClassFilter("all");
                    setLevelFilter("all");
                    setSearchTerm("");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredSpells.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No spells found matching your filters</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpells.map((spell) => (
                  <SpellCard
                    key={spell.id}
                    spell={spell}
                    variant="library"
                    onAdd={handleAddSpell}
                    disabled={currentCapacity >= 5}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}