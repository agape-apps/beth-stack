import * as elements from "typed-html";
import { Shopping } from "../db/schema";

export function RootPage() {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The BETH Stack</title>
    <script src="https://unpkg.com/htmx.org@1.9.3"></script>
    <script src="https://unpkg.com/hyperscript.org@0.9.14"></script>
    <link rel="stylesheet" href="/css/my-bulma.css">
</head>

<body
  class="has-background-light"
  hx-get="/shopping"
  hx-swap="innerHTML"
  hx-trigger="load"
></body>
</html>
  `;
}

export function ShoppingItem({ id, name, purchased }: Shopping) {
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

export function ShoppingList({ shoppingItems }: { shoppingItems: Shopping[] }) {
  return (
    <div class="container">
      <div class="section">
        <h1 class="title has-text-centered has-text-info is-2">Shopping List</h1>
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet">
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

export function ShoppingForm() {
  return (
    <form
      class="field has-addons mt-5"
      hx-post="/shopping"
      hx-swap="beforebegin"
      _="on htmx:afterOnLoad
         if event.detail.successful
           set the value of <input/> in me to ''"
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
