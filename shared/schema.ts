import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const spells = pgTable("spells", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  class: text("class").notNull(),
  level: integer("level").notNull(),
  description: text("description").notNull(),
  spell: text("spell").notNull(),
  type: text("type").notNull(),
  concentration: text("concentration").notNull(),
  upcast: text("upcast").notNull(),
  range: text("range").notNull(),
});

export const ringStorage = pgTable("ring_storage", {
  id: serial("id").primaryKey(),
  spellId: integer("spell_id").notNull(),
  addedAt: text("added_at").notNull(),
  upcastLevel: integer("upcast_level").notNull().default(0),
});

export const insertSpellSchema = createInsertSchema(spells).omit({
  id: true,
});

export const insertRingStorageSchema = createInsertSchema(ringStorage).omit({
  id: true,
  addedAt: true,
}).extend({
  upcastLevel: z.number().min(0).default(0),
});

export type InsertSpell = z.infer<typeof insertSpellSchema>;
export type Spell = typeof spells.$inferSelect;
export type InsertRingStorage = z.infer<typeof insertRingStorageSchema>;
export type RingStorage = typeof ringStorage.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
