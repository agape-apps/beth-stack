import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";
import { db } from "./db";
import { Shopping, shoppingItems } from "./db/schema";

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

const BaseHtml = ({ children }: any) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The BETH Stack</title>
    <script src="https://unpkg.com/htmx.org@1.9.3"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
</head>

${children}
`;

function ShoppingItem({ id, name, purchased }: Shopping) {
  return (
    <div class="box mb-2 is-flex is-align-items-center is-justify-content-space-between">
      <div class="is-flex is-align-items-center">
        <input
          type="checkbox"
          class="mr-4"
          checked={purchased}
          hx-post={`/shopping/${id}/toggle`}
          hx-target="closest div.box"
          hx-swap="outerHTML"
        />
        <p class="is-size-5">{name}</p>
      </div>
      <button
        class="button is-small is-danger"
        hx-delete={`/shopping/${id}`}
        hx-target="closest div.box"
        hx-swap="outerHTML"
      >
        X
      </button>
    </div>
  );
}

function ShoppingList({ shoppingItems }: { shoppingItems: Shopping[] }) {
  return (
    <div class="container">
      <div class="section">
        <h1 class="title has-text-centered has-text-info is-2">Shopping List</h1>
        <div class="columns is-centered">
          <div class="column is-half">
            <div class="card">
              <div class="card-content">
                {shoppingItems.map((shoppingItem: Shopping) => (
                  <ShoppingItem {...shoppingItem} />
                ))}
                <ShoppingForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingForm() {
  return (
    <form
      class="field has-addons mt-5"
      hx-post="/shopping"
      hx-swap="beforebegin"
      _="target"
    >
      <div class="control is-expanded">
        <input type="text" name="name" class="input is-info" placeholder="Add item" />
      </div>
      <div class="control">
        <button type="submit" class="button is-info">Add</button>
      </div>
    </form>
  );
}

