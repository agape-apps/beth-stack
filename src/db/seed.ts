import { shoppingItems } from "./schema.ts";
import { db } from "./";

if (!("DATABASE_URL" in process.env))
  throw new Error("DATABASE_URL not found on .env.development");

const seed = async () => {
  const records = [
    {
      name: "Eggs",
    },
    {
      name: "Coffee",
    },
  ];

  console.log("Seed start");
  await db.insert(shoppingItems).values(records);
  console.log("Seed done");
};

seed();
