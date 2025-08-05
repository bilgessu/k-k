import {
  users,
  children,
  valueRecordings,
  stories,
  listeningHistory,
  lullabies,
  type User,
  type UpsertUser,
  type Child,
  type InsertChild,
  type ValueRecording,
  type InsertValueRecording,
  type Story,
  type InsertStory,
  type ListeningHistory,
  type InsertListeningHistory,
  type Lullaby,
  type InsertLullaby,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Child operations
  getChildren(parentId: string): Promise<Child[]>;
  getChild(id: string): Promise<Child | undefined>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, updates: Partial<InsertChild>): Promise<Child>;
  
  // Value recording operations
  createValueRecording(recording: InsertValueRecording): Promise<ValueRecording>;
  getValueRecordings(parentId: string): Promise<ValueRecording[]>;
  updateValueRecording(id: string, updates: Partial<ValueRecording>): Promise<ValueRecording>;
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getStories(childId?: string): Promise<Story[]>;
  getStory(id: string): Promise<Story | undefined>;
  
  // Listening history operations
  createListeningHistory(history: InsertListeningHistory): Promise<ListeningHistory>;
  getListeningHistory(childId: string): Promise<ListeningHistory[]>;
  
  // Lullaby operations
  createLullaby(lullaby: InsertLullaby): Promise<Lullaby>;
  getLullabies(parentId: string, childId?: string): Promise<Lullaby[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Child operations
  async getChildren(parentId: string): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.parentId, parentId));
  }

  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }

  async createChild(child: InsertChild): Promise<Child> {
    const [newChild] = await db.insert(children).values(child).returning();
    return newChild;
  }

  async updateChild(id: string, updates: Partial<InsertChild>): Promise<Child> {
    const [child] = await db
      .update(children)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(children.id, id))
      .returning();
    return child;
  }

  // Value recording operations
  async createValueRecording(recording: InsertValueRecording): Promise<ValueRecording> {
    const [newRecording] = await db.insert(valueRecordings).values(recording).returning();
    return newRecording;
  }

  async getValueRecordings(parentId: string): Promise<ValueRecording[]> {
    return await db
      .select()
      .from(valueRecordings)
      .where(eq(valueRecordings.parentId, parentId))
      .orderBy(desc(valueRecordings.createdAt));
  }

  async updateValueRecording(id: string, updates: Partial<ValueRecording>): Promise<ValueRecording> {
    const [recording] = await db
      .update(valueRecordings)
      .set(updates)
      .where(eq(valueRecordings.id, id))
      .returning();
    return recording;
  }

  // Story operations
  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async getStories(childId?: string): Promise<Story[]> {
    const query = db.select().from(stories);
    
    if (childId) {
      return await query.where(eq(stories.childId, childId)).orderBy(desc(stories.createdAt));
    }
    
    return await query.orderBy(desc(stories.createdAt));
  }

  async getStory(id: string): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  // Listening history operations
  async createListeningHistory(history: InsertListeningHistory): Promise<ListeningHistory> {
    const [newHistory] = await db.insert(listeningHistory).values(history).returning();
    return newHistory;
  }

  async getListeningHistory(childId: string): Promise<ListeningHistory[]> {
    return await db
      .select()
      .from(listeningHistory)
      .where(eq(listeningHistory.childId, childId))
      .orderBy(desc(listeningHistory.createdAt));
  }

  // Lullaby operations
  async createLullaby(lullaby: InsertLullaby): Promise<Lullaby> {
    const [newLullaby] = await db.insert(lullabies).values(lullaby).returning();
    return newLullaby;
  }

  async getLullabies(parentId: string, childId?: string): Promise<Lullaby[]> {
    if (childId) {
      return await db
        .select()
        .from(lullabies)
        .where(and(eq(lullabies.parentId, parentId), eq(lullabies.childId, childId)))
        .orderBy(desc(lullabies.createdAt));
    }
    
    return await db
      .select()
      .from(lullabies)
      .where(eq(lullabies.parentId, parentId))
      .orderBy(desc(lullabies.createdAt));
  }
}

export const storage = new DatabaseStorage();
