import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";
import { db } from "./db";
import { Shopping, shoppingItems } from "./db/schema";

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body
          class="flex w-full h-screen justify-center items-center"
          hx-get="/shopping"
          hx-swap="innerHTML"
          hx-trigger="load"
        />
      </BaseHtml>
    )
  )
  .get("/shopping", async () => {
    const data = await db.select().from(shoppingItems).all();
    return <ShoppingList shoppingItems={data} />;
  })
  .post(
    "/shopping/:id/toggle",
    async ({ params }) => {
      const currentState = await db
        .select()
        .from(shoppingItems)
        .where(eq(shoppingItems.id, params.id as unknown as number))
        .get();

      const newState = await db
        .update(shoppingItems)
        .set({ purchased: !currentState?.purchased })
        .where(eq(shoppingItems.id, params.id as unknown as number))
        .returning()
        .get();

      return <ShoppingItem {...newState} />;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .delete(
    "/shopping/:id",
    async ({ params }) => {
      await db
        .delete(shoppingItems)
        .where(eq(shoppingItems.id, params.id as unknown as number))
        .run();
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    "shopping",
    async ({ body }: any) => {
      if (body.name.length === 0) {
        throw new Error("Name cannot be empty");
      }

      const newItem = await db
        .insert(shoppingItems)
        .values(body)
        .returning()
        .get();
      return <ShoppingItem {...newItem} />;
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .listen(3000);

console.log(
  `Your application is running at http://${app.server?.hostname}:${app.server?.port}`
);

const BaseHtml = ({ children }: any) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The BETH Stack</title>
    <script src="https://unpkg.com/htmx.org@1.9.3"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

${children}
`;

function ShoppingItem({ id, name, purchased }: Shopping) {
  return (
    <div class="flex flex-row space-x-4">
      <p>{name}</p>
      <input
        type="checkbox"
        checked={purchased}
        hx-post={`/shopping/${id}/toggle`}
        hx-target="closest div"
        hx-swap="outerHTML"
      />
      <button
        class="text-red-300"
        hx-delete={`/shopping/${id}`}
        hx-target="closest div"
        hx-swap="outerHTML"
      >
        X
      </button>
    </div>
  );
}

function ShoppingList({ shoppingItems }: { shoppingItems: Shopping[] }) {
  return (
    <div>
      {shoppingItems.map((shoppingItem: Shopping) => (
        <ShoppingItem {...shoppingItem} />
      ))}
      <ShoppingForm />
    </div>
  );
}

function ShoppingForm() {
  return (
    <form
      class="flex flex-row space-x-5 mt-5"
      hx-post="/shopping"
      hx-swap="beforebegin"
      _="target"
    >
      <input type="text" name="name" class="border border-black p-2" />
      <button type="submit">Add</button>
    </form>
  );
}
