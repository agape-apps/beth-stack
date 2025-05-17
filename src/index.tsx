import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";
import { db } from "./db";
import { shoppingItems } from "./db/schema";
import { BaseHtml, ShoppingItem, ShoppingList } from "./components/shoppinglist";

// for serving static pages with images
import { staticPlugin } from "@elysiajs/static";
import { readFileSync } from "fs";
import { join } from "path";

const app = new Elysia()
  .use(html())

  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body
          class="has-background-light"
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

  // for serving static html pages, images, css and js from the public directory
  // without prefix all files are served from root and relative paths work
  .use(
    staticPlugin({
      assets: "public",
      prefix: "",
    })
  )

  .get("/:page?", ({ params }) => {
    try {
      // Default to "index" if no page parameter is provided
      let pageName = params.page || "index";

      // Remove .html extension if it exists in the URL
      if (pageName.endsWith('.html')) {
        pageName = pageName.slice(0, -5);
      }

      const filePath = join(process.cwd(), "public", `${pageName}.html`);
      const content = readFileSync(filePath, "utf-8");

      return new Response(content, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    } catch (error) {
      return new Response("Page not found", { status: 404 });
    }
  })

  .listen(3000);

console.log(
  `Your application is running at http://${app.server?.hostname}:${app.server?.port}`
);



