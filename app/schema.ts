import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";

// Users
export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 64 }),
  password: varchar("password", { length: 64 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  tokens: many(tokens, { relationName: "userTokens" }),
}));

// Tokens
export const tokens = pgTable("Token", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 228 }).notNull(),
  key: varchar("key", { length: 228 }).notNull(),
  expired: boolean("expired").notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
  term: one(users, {
    fields: [tokens.userId],
    references: [users.id],
    relationName: "userTokens",
  }),
}));

export type Token = typeof tokens.$inferSelect;

// Projects
export const projects = pgTable("Project", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  refLang: varchar("lang", { length: 8 }).notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Terms and its translations
export const terms = pgTable("Term", {
  id: serial("id").primaryKey(),
  term: varchar("term", { length: 128 }).notNull(),
  projectId: integer("project_id")
    .references(() => projects.id)
    .notNull(),
});

export const termsRelations = relations(terms, ({ many }) => ({
  translations: many(translations, { relationName: "termTranslations" }),
}));

export type Term = typeof terms.$inferSelect;
export type NewTerm = typeof terms.$inferInsert;

export const translations = pgTable("Translation", {
  id: serial("id").primaryKey(),
  termId: integer("term_id")
    .references(() => terms.id)
    .notNull(),
  translation: text("translation").notNull(),
  lang: varchar("lang", { length: 8 }).notNull(),
});

export const translationsRelations = relations(translations, ({ one }) => ({
  term: one(terms, {
    fields: [translations.termId],
    references: [terms.id],
    relationName: "termTranslations",
  }),
}));

export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;
