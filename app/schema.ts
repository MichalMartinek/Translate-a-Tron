import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 64 }),
  password: varchar("password", { length: 64 }),
});

export const terms = pgTable("Term", {
  id: serial("id").primaryKey(),
  term: varchar("term", { length: 128 }),
});

export type Term = typeof terms.$inferSelect; // return type when queried
export type NewTerm = typeof terms.$inferInsert; // insert type

export const translations = pgTable("Translation", {
  id: serial("id").primaryKey(),
  termId: integer("term_id").references(() => terms.id),
  translation: text("translation"),
  lang: varchar("lang", { length: 8 }),
});

export type Translation = typeof translations.$inferSelect; // return type when queried
export type NewTranslation = typeof translations.$inferInsert; // insert type

export type TermWithTranslation = {
  Term: Term;
  Translation: Translation | null;
};
