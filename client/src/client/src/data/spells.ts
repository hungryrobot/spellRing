// This file contains all 1,178 spells from the uploaded CSV
// Generated from the user's complete D&D spell collection

import { type Spell } from "@shared/schema";
import spellData from "./spell-data.json";

// Transform the imported data to match our Spell type (without database id)
export const ALL_SPELLS: Omit<Spell, 'id'>[] = spellData.map((spell: any, index: number) => ({
  name: spell.name,
  class: spell.class,
  level: spell.level,
  description: spell.description,
  spell: spell.spell,
  type: spell.type,
  concentration: spell.concentration,
  upcast: spell.upcast,
  range: spell.range
}));