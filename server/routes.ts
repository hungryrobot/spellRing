import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSpellSchema, insertRingStorageSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import Papa from "papaparse";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all spells
  app.get("/api/spells", async (req, res) => {
    try {
      const spells = await storage.getAllSpells();
      res.json(spells);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spells" });
    }
  });

  // Upload and parse CSV
  app.post("/api/spells/upload", upload.single("csvFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvData = req.file.buffer.toString("utf8");
      
      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim(),
      });

      if (parseResult.errors.length > 0) {
        return res.status(400).json({ 
          message: "CSV parsing failed", 
          errors: parseResult.errors 
        });
      }

      // Debug: log the first row to see column names
      const firstRow = parseResult.data[0] || {};
      console.log("CSV Headers detected:", Object.keys(firstRow));
      console.log("First row sample:", firstRow);

      // Create separate spell entries for each class
      const spells = [];
      
      for (const row of parseResult.data as any[]) {
        // Try multiple possible column names for class
        let classValue = row.class?.trim() || 
                        row.classes?.trim() || 
                        row.spellclass?.trim() || 
                        row.school?.trim() ||
                        row.caster?.trim() ||
                        row.casterclass?.trim() ||
                        row.dndclass?.trim() ||
                        row.characterclass?.trim() ||
                        "";
        
        // Split classes by comma and create an entry for each
        const classes = classValue ? classValue.split(',').map((c: string) => c.trim()).filter((c: string) => c) : [''];
        
        console.log(`Processing spell: ${row.name}, classes found: ${classes.join(', ')}`);
        
        // Create a spell entry for each class
        for (const className of classes) {
          spells.push({
            name: row.name?.trim() || "",
            class: className,
            level: parseInt(row.level) || parseInt(row.spelllevel) || 0,
            description: row.description?.trim() || row.desc?.trim() || "",
            spell: row.spell?.trim() || row.description?.trim() || row.desc?.trim() || "",
            type: row.type?.trim() || "Spell",
            concentration: row.concentration?.trim() || "No",
            upcast: row.upcast?.trim() || "No",
            range: row.range?.trim() || "Unknown",
          });
        }
      }

      // Validate each spell and filter out empty rows
      const validSpells = [];
      const errors = [];

      for (let i = 0; i < spells.length; i++) {
        // Skip rows with empty or missing name
        if (!spells[i].name || spells[i].name.trim() === '') {
          continue;
        }
        
        try {
          const validSpell = insertSpellSchema.parse(spells[i]);
          validSpells.push(validSpell);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          message: "Some spells failed validation", 
          errors 
        });
      }

      // Clear existing spells and add new ones
      await storage.deleteAllSpells();
      const createdSpells = await storage.createSpells(validSpells);

      res.json({ 
        message: `Successfully imported ${createdSpells.length} spells`,
        spells: createdSpells 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload CSV" });
    }
  });

  // Get ring storage
  app.get("/api/ring", async (req, res) => {
    try {
      const ringStorage = await storage.getRingStorage();
      res.json(ringStorage);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ring storage" });
    }
  });

  // Add spell to ring
  app.post("/api/ring", async (req, res) => {
    try {
      const insertRingStorage = insertRingStorageSchema.parse(req.body);
      
      // Check capacity
      const currentRing = await storage.getRingStorage();
      const currentCapacity = currentRing.reduce((sum, item) => sum + (item.spell.level + item.upcastLevel), 0);
      
      // Get the spell to check its level
      const allSpells = await storage.getAllSpells();
      const spell = allSpells.find(s => s.id === insertRingStorage.spellId);
      
      if (!spell) {
        return res.status(404).json({ message: "Spell not found" });
      }

      const effectiveLevel = spell.level + (insertRingStorage.upcastLevel || 0);
      if (currentCapacity + effectiveLevel > 5) {
        return res.status(400).json({ 
          message: `Cannot add spell. Ring capacity exceeded. Current: ${currentCapacity}/5, Effective spell level: ${effectiveLevel}` 
        });
      }

      const ringStorage = await storage.addSpellToRing(insertRingStorage);
      res.json(ringStorage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      res.status(500).json({ message: "Failed to add spell to ring" });
    }
  });

  // Remove spell from ring
  app.delete("/api/ring/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await storage.removeSpellFromRing(id);
      res.json({ message: "Spell removed from ring" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove spell from ring" });
    }
  });

  // Clear ring storage
  app.delete("/api/ring", async (req, res) => {
    try {
      await storage.clearRingStorage();
      res.json({ message: "Ring storage cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear ring storage" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
