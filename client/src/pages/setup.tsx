import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiManager } from "@/lib/api";
import { useLocation } from "wouter";

export default function Setup() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Check if server is available
      const storageType = await apiManager.getStorageType();
      
      if (storageType === 'server') {
        // Use server upload
        const formData = new FormData();
        formData.append("csvFile", file);
        
        const response = await fetch("/api/spells/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        return response.json();
      } else {
        // Parse CSV locally using browser
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const csvText = e.target?.result as string;
              const Papa = await import('papaparse');
              
              const parsed = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header: string) => header.toLowerCase().trim(),
              });

              if (parsed.errors.length > 0) {
                throw new Error(`CSV parsing error: ${parsed.errors[0].message}`);
              }

              // Group spells by name and combine classes
              const spellMap = new Map();
              
              parsed.data.forEach((row: any) => {
                const spellName = row.name?.trim() || '';
                if (!spellName) return;
                
                // Handle comma-separated classes
                let classValue = row.class?.trim() || row.classes?.trim() || '';
                const classes = classValue ? classValue.split(',').map((c: string) => c.trim()) : [''];
                
                if (spellMap.has(spellName)) {
                  // Add new classes to existing spell
                  const existingSpell = spellMap.get(spellName);
                  const existingClasses = existingSpell.class.split(',').map((c: string) => c.trim());
                  const allClasses = [...new Set([...existingClasses, ...classes])];
                  existingSpell.class = allClasses.join(', ');
                } else {
                  // Create new spell entry
                  spellMap.set(spellName, {
                    name: spellName,
                    class: classes.join(', '),
                    level: parseInt(row.level) || 0,
                    description: row.description || '',
                    spell: row.description || '', // Keep legacy field for compatibility
                    type: row.type || '',
                    concentration: row.concentration || '',
                    upcast: row.upcast || '',
                    range: row.range || '',
                    isFavorite: false
                  });
                }
              });
              
              const spells = Array.from(spellMap.values()).filter(spell => spell.name && spell.class);

              // Clear existing spells and add new ones
              await apiManager.deleteAllSpells();
              const result = await apiManager.createSpells(spells);
              resolve({ message: `Successfully imported ${result.length} spells (Local Storage Mode)`, count: result.length });
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      // Force refresh of spells data on home page
      queryClient.invalidateQueries({ queryKey: ["/api/spells"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-purple-600 mb-2">
            D&D Ring of Spell Storage
          </CardTitle>
          <p className="text-gray-600">Upload your spell database to get started</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? "border-purple-500 bg-purple-50" 
                : "border-gray-300 hover:border-purple-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                {file ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              {file ? (
                <div>
                  <p className="text-lg font-medium text-gray-700">File Selected</p>
                  <p className="text-sm text-gray-500">{file.name}</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-700">Drop your CSV file here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
              )}
              
              <div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-50"
                    asChild
                  >
                    <span>Choose File</span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          {/* CSV Format Info */}
          <Card className="bg-gray-100">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Expected CSV Format:</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Your CSV should include columns: Name, Class, Level, Description, Spell, Type, Concentration, Upcast, Range
                  </p>
                  <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded overflow-x-auto">
                    Name,Class,Level,Description,Spell,Type,Concentration,Upcast,Range<br />
                    "Fireball","Wizard","3","A bright streak flashes...","Full spell details","Spell","No","Yes","150 feet"
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload & Continue"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="flex-1"
            >
              Skip Setup
            </Button>
          </div>

          {/* Error Display */}
          {uploadMutation.isError && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Upload Error</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  {uploadMutation.error?.message}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
