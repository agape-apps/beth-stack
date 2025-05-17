# BETH Stack with Bulma

An opinionated hypermedia-driven web framework that prioritizes developer experience while still having amazing performance.

This stack consists of Bun, Elysia, TypeScript, JSX templates, HTMX, Hyperscript and Bulma CSS

There is no build step required for TypeScript and JSX. Bulma only requires a build step when customizing the theme.

![Screenshot](docs/ShoppingListScreenshot.png)

## Resources

- The BETH Stack is based on the Medium article [here](https://medium.com/@wezzcoetzee/the-beth-stack-c5887a606ed3)

- The static site is based on the Bulma Tropico template: [restylianos/bulma-tropico-template: Bulma tropico template 🍍](https://github.com/restylianos/bulma-tropico-template)

### Commands

Run the server

```
bun run start
```

Kill the server

```
lsof -t -i :3000 | xargs kill
```

### Customize Bulma with Sass
- https://bulma.io/documentation/customize/with-sass/

Use either

```
bun run build:bulma
bun run dev:bulma
```

### TODO
- Create an HTMX Version of the Tropico template with a mobile dropdown menu

### Potential Issues

- Route Conflict: The /:page? catch-all route might conflict with other specific routes if they're defined after it. Currently it's placed before the .listen(3000) call, which is correct.

- Error Handling: The error response is basic. You might want to enhance it with more detailed error information or a custom 404 page.

- Performance: Reading files synchronously with  readFileSync could impact performance under high load. Consider caching frequently accessed pages or using async file reading.

- Security: There's no path sanitization to prevent directory traversal attacks. Consider validating the page parameter to ensure it doesn't contain characters like ../.

- Overall, the implementation extends the original codebase to serve static content while maintaining all the original functionality.