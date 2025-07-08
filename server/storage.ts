import { spells, ringStorage, users, type Spell, type InsertSpell, type RingStorage, type InsertRingStorage, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Spell management
  getAllSpells(): Promise<Spell[]>;
  createSpell(spell: InsertSpell): Promise<Spell>;
  createSpells(spells: InsertSpell[]): Promise<Spell[]>;
  deleteAllSpells(): Promise<void>;
  
  // Ring storage management
  getRingStorage(): Promise<(RingStorage & { spell: Spell })[]>;
  addSpellToRing(ringStorage: InsertRingStorage): Promise<RingStorage>;
  removeSpellFromRing(id: number): Promise<void>;
  clearRingStorage(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private spells: Map<number, Spell>;
  private ringStorage: Map<number, RingStorage>;
  private currentUserId: number;
  private currentSpellId: number;
  private currentRingId: number;

  constructor() {
    this.users = new Map();
    this.spells = new Map();
    this.ringStorage = new Map();
    this.currentUserId = 1;
    this.currentSpellId = 1;
    this.currentRingId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllSpells(): Promise<Spell[]> {
    return Array.from(this.spells.values());
  }

  async createSpell(insertSpell: InsertSpell): Promise<Spell> {
    const id = this.currentSpellId++;
    const spell: Spell = { ...insertSpell, id };
    this.spells.set(id, spell);
    return spell;
  }

  async createSpells(insertSpells: InsertSpell[]): Promise<Spell[]> {
    const createdSpells: Spell[] = [];
    for (const insertSpell of insertSpells) {
      const spell = await this.createSpell(insertSpell);
      createdSpells.push(spell);
    }
    return createdSpells;
  }

  async deleteAllSpells(): Promise<void> {
    this.spells.clear();
    this.ringStorage.clear();
    this.currentSpellId = 1;
    this.currentRingId = 1;
  }

  async getRingStorage(): Promise<(RingStorage & { spell: Spell })[]> {
    const ringStorageWithSpells: (RingStorage & { spell: Spell })[] = [];
    const storageArray = Array.from(this.ringStorage.values());
    for (const storage of storageArray) {
      const spell = this.spells.get(storage.spellId);
      if (spell) {
        ringStorageWithSpells.push({ ...storage, spell });
      }
    }
    return ringStorageWithSpells;
  }

  async addSpellToRing(insertRingStorage: InsertRingStorage): Promise<RingStorage> {
    const id = this.currentRingId++;
    const ringStorage: RingStorage = { 
      ...insertRingStorage, 
      id, 
      addedAt: new Date().toISOString(),
      upcastLevel: insertRingStorage.upcastLevel || 0
    };
    this.ringStorage.set(id, ringStorage);
    return ringStorage;
  }

  async removeSpellFromRing(id: number): Promise<void> {
    this.ringStorage.delete(id);
  }

  async clearRingStorage(): Promise<void> {
    this.ringStorage.clear();
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllSpells(): Promise<Spell[]> {
    return await db.select().from(spells);
  }

  async createSpell(insertSpell: InsertSpell): Promise<Spell> {
    const [spell] = await db
      .insert(spells)
      .values(insertSpell)
      .returning();
    return spell;
  }

  async createSpells(insertSpells: InsertSpell[]): Promise<Spell[]> {
    if (insertSpells.length === 0) return [];
    return await db
      .insert(spells)
      .values(insertSpells)
      .returning();
  }

  async deleteAllSpells(): Promise<void> {
    await db.delete(ringStorage);
    await db.delete(spells);
  }

  async getRingStorage(): Promise<(RingStorage & { spell: Spell })[]> {
    return await db
      .select({
        id: ringStorage.id,
        spellId: ringStorage.spellId,
        addedAt: ringStorage.addedAt,
        upcastLevel: ringStorage.upcastLevel,
        spell: spells
      })
      .from(ringStorage)
      .innerJoin(spells, eq(ringStorage.spellId, spells.id));
  }

  async addSpellToRing(insertRingStorage: InsertRingStorage): Promise<RingStorage> {
    const [ring] = await db
      .insert(ringStorage)
      .values({
        ...insertRingStorage,
        addedAt: new Date().toISOString(),
        upcastLevel: insertRingStorage.upcastLevel || 0
      })
      .returning();
    return ring;
  }

  async removeSpellFromRing(id: number): Promise<void> {
    await db.delete(ringStorage).where(eq(ringStorage.id, id));
  }

  async clearRingStorage(): Promise<void> {
    await db.delete(ringStorage);
  }
}

export const storage = new DatabaseStorage();
