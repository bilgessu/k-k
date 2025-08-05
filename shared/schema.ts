import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Child profiles
export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  age: integer("age").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Value recordings from parents
export const valueRecordings = pgTable("value_recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull().references(() => users.id),
  childId: varchar("child_id").references(() => children.id),
  title: varchar("title").notNull(),
  description: text("description"),
  audioUrl: varchar("audio_url"),
  transcript: text("transcript"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated stories
export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  valueRecordingId: varchar("value_recording_id").references(() => valueRecordings.id),
  childId: varchar("child_id").references(() => children.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  audioUrl: varchar("audio_url"),
  duration: integer("duration"), // in seconds
  ageRange: varchar("age_range"),
  values: text("values").array(), // Array of values like ['respect', 'kindness']
  createdAt: timestamp("created_at").defaultNow(),
});

// Child listening history
export const listeningHistory = pgTable("listening_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull().references(() => children.id),
  storyId: varchar("story_id").notNull().references(() => stories.id),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // how long they listened
  createdAt: timestamp("created_at").defaultNow(),
});

// Lullabies with parent's voice
export const lullabies = pgTable("lullabies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull().references(() => users.id),
  childId: varchar("child_id").references(() => children.id),
  title: varchar("title").notNull(),
  audioUrl: varchar("audio_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertChildSchema = createInsertSchema(children).pick({
  parentId: true,
  name: true,
  age: true,
  profileImageUrl: true,
});

export const insertValueRecordingSchema = createInsertSchema(valueRecordings).pick({
  parentId: true,
  childId: true,
  title: true,
  description: true,
  audioUrl: true,
  transcript: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  valueRecordingId: true,
  childId: true,
  title: true,
  content: true,
  audioUrl: true,
  duration: true,
  ageRange: true,
  values: true,
});

export const insertListeningHistorySchema = createInsertSchema(listeningHistory).pick({
  childId: true,
  storyId: true,
  duration: true,
});

export const insertLullabySchema = createInsertSchema(lullabies).pick({
  parentId: true,
  childId: true,
  title: true,
  audioUrl: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;
export type InsertValueRecording = z.infer<typeof insertValueRecordingSchema>;
export type ValueRecording = typeof valueRecordings.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;
export type InsertListeningHistory = z.infer<typeof insertListeningHistorySchema>;
export type ListeningHistory = typeof listeningHistory.$inferSelect;
export type InsertLullaby = z.infer<typeof insertLullabySchema>;
export type Lullaby = typeof lullabies.$inferSelect;
