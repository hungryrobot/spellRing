import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Search, BookOpen, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { type Spell } from "@shared/schema";
import SpellCard from "@/components/spell-card";
import CapacityIndicator from "@/components/capacity-indicator";

export default function Home() {
  const [classFilter, setClassFilter] = useState<string>("Wizard");
  const [levelFilter, setLevelFilter] = useState<string>("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch spells
  const { data: spells = [], isLoading: spellsLoading } = useQuery({
    queryKey: ["/api/spells"],
  });

  // Fetch ring storage
  const { data: ringStorage = [], isLoading: ringLoading } = useQuery({
    queryKey: ["/api/ring"],
  });

  // Add spell to ring mutation
  const addSpellMutation = useMutation({
    mutationFn: async ({ spellId, upcastLevel = 0 }: { spellId: number; upcastLevel?: number }) => {
      return apiRequest("POST", "/api/ring", { spellId, upcastLevel });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ring"] });
      toast({
        title: "Spell Added",
        description: "Spell has been added to your ring",
      });
    },
    onError: (error) => {
      toast({
        title: "Cannot Add Spell",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove spell from ring mutation
  const removeSpellMutation = useMutation({
    mutationFn: async (ringId: number) => {
      return apiRequest("DELETE", `/api/ring/${ringId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ring"] });
      toast({
        title: "Spell Removed",
        description: "Spell has been removed from your ring",
      });
    },
    onError: (error) => {
      toast({
        title: "Cannot Remove Spell",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate current capacity (treat level 0 and 1 as level 1)
  const currentCapacity = useMemo(() => {
    return ringStorage.reduce((sum: number, item: any) => {
      const baseLevel = item.spell.level === 0 ? 1 : item.spell.level;
      return sum + (baseLevel + (item.upcastLevel || 0));
    }, 0);
  }, [ringStorage]);

  // Filter spells
  const filteredSpells = useMemo(() => {
    return spells.filter((spell: Spell) => {
      const matchesClass = classFilter === "all" || spell.class.toLowerCase() === classFilter.toLowerCase();
      const matchesLevel = levelFilter === "all" || 
        (levelFilter === "cantrip" && spell.level === 0) ||
        (levelFilter !== "cantrip" && spell.level.toString() === levelFilter);
      const matchesSearch = !searchTerm || spell.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesClass && matchesLevel && matchesSearch;
    });
  }, [spells, classFilter, levelFilter, searchTerm]);

  // Get unique classes for filter dropdown
  const availableClasses = useMemo(() => {
    const classes = spells
      .map((spell: Spell) => spell.class)
      .filter((className: string) => className && className.trim() !== "");
    return [...new Set(classes)].sort();
  }, [spells]);

  // Get unique levels for filter dropdown
  const availableLevels = useMemo(() => {
    const levels = spells
      .map((spell: Spell) => spell.level)
      .filter((level: number) => level !== undefined && level !== null);
    return [...new Set(levels)].sort((a, b) => a - b);
  }, [spells]);

  const handleAddSpell = (spell: Spell, upcastLevel: number = 0) => {
    // Treat level 0 and 1 spells as level 1 for capacity calculations
    const baseLevel = spell.level === 0 ? 1 : spell.level;
    const effectiveLevel = baseLevel + upcastLevel;
    
    // Check if ring is at capacity
    if (currentCapacity + effectiveLevel > 5) {
      toast({
        title: "Ring Full",
        description: `Cannot add ${spell.name}. Ring capacity would be exceeded (${currentCapacity + effectiveLevel}/5  levels).`,
        variant: "destructive",
      });
      return;
    }
    
    addSpellMutation.mutate({ spellId: spell.id, upcastLevel });
  };

  const handleRemoveSpell = (ringId: number) => {
    removeSpellMutation.mutate(ringId);
  };

  const isLoading = spellsLoading || ringLoading;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Combined Header and Ring Storage Section */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-purple-600">Ring of Spell Storage</h1>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <CapacityIndicator current={currentCapacity} max={5} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/setup")}
                    className="text-gray-600 hover:text-purple-600"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {ringStorage.length} spells stored - {currentCapacity}/5  levels stored
                  {currentCapacity >= 5 && <span className="text-red-600 font-semibold ml-2">(FULL)</span>}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {ringStorage.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No spells stored in the ring</p>
                  <p className="text-sm text-gray-400">Add spells from the library to get started</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-3">
                    {ringStorage.map((item: any) => (
                      <SpellCard
                        key={item.id}
                        spell={item.spell}
                        variant="ring"
                        onRemove={handleRemoveSpell}
                        ringId={item.id}
                        upcastLevel={item.upcastLevel || 0}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Spell Library Section */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span>Spell Library</span>
                </div>
                <span className="text-sm text-gray-600">
                  {filteredSpells.length} spells
                </span>
              </CardTitle>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="class-filter">Class</Label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger id="class-filter">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {availableClasses.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level-filter">Level</Label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger id="level-filter">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {availableLevels.includes(0) && <SelectItem value="cantrip">Cantrip</SelectItem>}
                      {availableLevels.filter(level => level > 0).map(level => {
                        const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
                        return (
                          <SelectItem key={level} value={level.toString()}>
                            {level}{suffix} Level
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search spells..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading spells...</p>
                </div>
              ) : filteredSpells.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No spells found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters or upload a CSV file</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredSpells.map((spell: Spell) => (
                      <SpellCard
                        key={spell.id}
                        spell={spell}
                        variant="library"
                        showCollapsedDescription={false}
                        onAdd={handleAddSpell}
                        disabled={currentCapacity + (spell.level === 0 ? 1 : spell.level) > 5}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
