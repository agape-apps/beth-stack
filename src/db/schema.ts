import { InferModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const shoppingItems = sqliteTable("shoppingItems", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  purchased: integer("purchased", { mode: "boolean" }).notNull().default(false),
});

export type Shopping = InferModel<typeof shoppingItems>;
