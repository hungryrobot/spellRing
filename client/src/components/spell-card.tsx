import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Eye, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { type Spell } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

interface SpellCardProps {
  spell: Spell;
  variant?: "library" | "ring";
  onAdd?: (spell: Spell, upcastLevel?: number) => void;
  onRemove?: (ringId: number) => void;
  ringId?: number;
  disabled?: boolean;
  upcastLevel?: number;
}

export default function SpellCard({ 
  spell, 
  variant = "library", 
  onAdd, 
  onRemove, 
  ringId, 
  disabled = false,
  upcastLevel = 0 
}: SpellCardProps) {
  const isRingCard = variant === "ring";
  const baseLevel = spell.level === 0 ? 1 : spell.level;
  const effectiveLevel = baseLevel + upcastLevel;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio context for spell cast sound
  const playSpellCastSound = () => {
    try {
      // Create a simple spell cast sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a magical "whoosh" sound
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported or failed to play');
    }
  };

  // Create audio context for add spell sound
  const playAddSpellSound = () => {
    try {
      // Create a different magical sound for adding spells
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a bright "chime" sound for adding
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.type = 'triangle';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio not supported or failed to play');
    }
  };

  // Class-based color mapping for borders and text
  const getClassColors = (className: string) => {
    const colors: Record<string, { border: string; text: string }> = {
      'Artificer': { border: 'border-orange-400', text: 'text-orange-600' },
      'Bard': { border: 'border-pink-400', text: 'text-pink-600' },
      'Cleric': { border: 'border-yellow-400', text: 'text-yellow-600' },
      'Druid': { border: 'border-green-400', text: 'text-green-600' },
      'Paladin': { border: 'border-blue-400', text: 'text-blue-600' },
      'Ranger': { border: 'border-emerald-400', text: 'text-emerald-600' },
      'Sorcerer': { border: 'border-red-400', text: 'text-red-600' },
      'Warlock': { border: 'border-purple-400', text: 'text-purple-600' },
      'Wizard': { border: 'border-indigo-400', text: 'text-indigo-600' }
    };
    return colors[className] || { border: 'border-gray-400', text: 'text-gray-600' };
  };

  const classColors = getClassColors(spell.class);

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200",
        isRingCard 
          ? `bg-white ${classColors.border} border-2` 
          : disabled 
            ? `bg-gray-100 border-gray-300 border-2 opacity-30 cursor-not-allowed`
            : `bg-white ${classColors.border} border-[3px] hover:shadow-md cursor-pointer`
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Condensed single line: action buttons, name, class, range, level */}
          <div className="flex items-center space-x-2 flex-1 min-w-0 mb-2">
            {/* Action buttons before title */}
            {isRingCard && onRemove && ringId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  playSpellCastSound();
                  // Small delay to let sound start before removing
                  setTimeout(() => {
                    onRemove(ringId);
                  }, 50);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto flex items-center gap-1 flex-shrink-0"
                title="Cast Spell (Remove from Ring)"
              >
                <Zap className="w-3 h-3" />
                <span className="text-xs">Cast Spell</span>
              </Button>
            )}
            
            {!isRingCard && onAdd && !disabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  playAddSpellSound();
                  onAdd(spell, 0);
                }}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 h-auto flex items-center gap-1 flex-shrink-0"
                title="Add to Ring"
              >
                <Plus className="w-3 h-3" />
                <span className="text-xs">Add Spell</span>
              </Button>
            )}
            
            <h3 className={cn("font-semibold text-base truncate", disabled ? "text-gray-400" : classColors.text)}>
              {spell.name}
            </h3>
            
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium flex-shrink-0",
                disabled ? "border-gray-300 text-gray-400" : `border-current ${classColors.text}`
              )}
            >
              {spell.class}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs flex items-center gap-1 flex-shrink-0",
                disabled ? "border-gray-300 text-gray-400" : "border-gray-500 text-gray-600"
              )}
            >
              <Eye className="w-3 h-3" />
              {spell.range}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium flex-shrink-0",
                disabled ? "border-gray-300 text-gray-400" : `border-current ${classColors.text}`
              )}
            >
              {spell.level === 0 ? "Cantrip" : `Level ${effectiveLevel}`}
            </Badge>
          </div>

          {/* Collapsible additional info */}
          {isDescriptionExpanded && (
            <div className="mb-2">
              {/* Concentration, Upcast badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {spell.concentration && spell.concentration.toLowerCase() === 'yes' && (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex items-center gap-1 border-gray-500 text-gray-600"
                  >
                    <Zap className="w-3 h-3" />
                    Concentration
                  </Badge>
                )}

                {spell.upcast && spell.upcast.toLowerCase() !== 'no' && (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex items-center gap-1 border-gray-500 text-gray-600"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Upcastable
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Collapsible Description and Details */}
          {isDescriptionExpanded && (
            <div className="mb-2">
              <p className="text-sm mb-2 text-gray-600">
                {spell.description}
              </p>
            </div>
          )}
        </div>

        {/* Show details button centered on the right */}
        <div className="flex items-center justify-center ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700"
          >
            {isDescriptionExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show details
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}