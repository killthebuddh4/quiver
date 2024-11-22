<p align="center">
  <img src="quiver-logo.png" width="200px" align="center" alt="Quiver logo" />
  <h1 align="center">Quiver</h1>
</p>
<br/>
<p align="center">
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/killthebuddh4/quiver" alt="License"></a>
<a href="https://twitter.com/killthebuddha_" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@killthebuddha_-4BBAAB.svg" alt="Created by Achilles Schmelzer"></a>
<a href="https://github.com/killthebuddh4/quiver" rel="nofollow"><img src="https://img.shields.io/github/stars/killthebuddh4/quiver" alt="stars"></a>
</p>

<div align="center">
<h2>a dead-simple 😵, secure 🔐, type-safe 🦄 RPC client and server<br />powered by the <a href="https://xmtp.org">XMTP</a> messaging protocol.<br /><br /></h2>
</div>

<div align="center">
  <a href="https://github.com/killthebuddh4/quiver#api-reference">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/TODO">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/@qrpc/quiver">npm</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/killthebuddh4/quiver/issues/new">Issues</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/killthebuddh4_">@killthebuddha_</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/killthebuddh4/fig">fig</a>
  <br />
  <br />
  <figure>
    <img src="./static/typescript.gif" alt="Demo" />
  </figure>
</div>

## Quickstart

`npm install @qrpc/quiver` or `yarn add @qrpc/quiver` or `pnpm add @qrpc/quiver`

1. Serve a function.
2. Call the function.
3. That's it!

```JavaScript
// server.ts

import quiver from "@qrpc/quiver";
import { xmtp } from "./xmtp.js";

const q = quiver.q();
q.serve(() => 42);

console.log(`Server running at ${q.address}`)
```

```JavaScript
// client.ts

import quiver from "@qrpc/quiver";

const q = quiver.q();
const client = q.client(process.env.SERVER_ADDRESS);
const answer = await client();

console.log(answer.data); // 42
```

That's all there is to it 🎉, you've just _deployed a function to the internet, and called that function, in ~10 lines of code!_ No DNS, AWS, GCP, LOL, or WTF's involved! To learn more, keep on reading! To see more advanced examples, jump ahead to the [Advanced Examples](#advanced-examples) section. If you're wondering where the magic happens, jump to [Under the Hood](#under-the-hood).

## Table of Contents

- [Quickstart](#quickstart)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [User Guide](#user-guide)
  - [Basic Example](#basic-example)
  - [Parameters](#parameters)
  - [Routers](#routers)
  - [TypeScript!](#typescript)
  - [Middleware](#middleware)
    - [Merging Middleware](#merging-middleware)
- [API Reference](#api-reference)
  - [`Quiver`](#quiver)
  - [`QuiverClient`](#quiverclient)
  - [`QuiverRouter`](#quiverrouter)
  - [`QuiverMiddleware`](#quivermiddleware)
  - [`QuiverProvider`](#quiverprovider)
- [Off-the-Shelf Middlewares](#off-the-shelf-middlewares)
- [Advanced Examples](#advanced-examples)
- [Under the Hood](#under-the-hood)
- [Roadmap](#roadmap)

## Features

`quiver` is an extremely simple way to rapidly build and deploy services to the internet. It's powered by [XMTP](https://xmtp.org) and inspired by [trpc](https://trpc.io).

- __Type-Safe Client/Server__
- __Type-Safe Middleware__
- __Fluent builder APIs__
- __End-to-End Encryption__
- __Dead-Simple__

## User Guide

### Basic Example

`quiver` lets you rapidly build secure client/server applications. The simplest possible example server is just a function with no arguments:

```JavaScript
// server.ts

import quiver from "@qrpc/quiver";

const q = quiver.q();

q.serve(() => 42);
```

In the above example, an XMTP network client is created inside the call to `quiver.q()`. This means that your server is listening to a random address. You'll probably want to re-use the same address. You can do this by manually initializing the XMTP client:

```JavaScript
// server.ts

import quiver from "@qrpc/quiver";

const xmtp = quiver.x({ init: { key: process.env.XMTP_SECRET_KEY } });

const q = quiver.q({ xmtp });

q.serve(() => 42);
```

Now the server will be running at whatever address corresponds to your `XMTP_SECRET_KEY`, and you can call it:

```JavaScript
// client.ts

import quiver from "@qrpc/quiver";

const quiver = quiver.q();

const client = quiver.client(process.env.SERVER_ADDRESS);

const answer = await client(); // { data: 42 }
```

### Parameters

A `QuiverFunction` can take parameters in the form of an object:

```JavaScript

// server.ts

import quiver from "@qrpc/quiver";

const q = quiver.q();

q.serve(({ name }) => `Hello, ${name}!`);
```

And the client can call this function, passing in an argument:

```JavaScript

// client.ts

import quiver from "@qrpc/quiver";

const client = quiver.client(process.env.SERVER_ADDRESS);

const answer = await client({ name: "Alice" }); // { data: "Hello, Alice!" }
```

### Routers

You'll probably want to serve more than just a single function. You can do this by using a `QuiverRouter` using the fluent-style builder API:

```JavaScript
// server.ts

import { q } from "./q";

const router = q.router()
  .function("a", () => "a")
  .function("b", () => "b")

q.serve(router);
```

And your client can call these functions:

```JavaScript
// client.ts

import { q } from "./q";

const client = q.client(process.env.SERVER_ADDRESS);

const a = await client.a(); // { data: "a" }
const b = await client.b(); // { data: "b" }
```

Routers can of course be nested:

```JavaScript
// router.ts

import { q } from "./q";

const hello = q.router()
  .function("a", (: { name: string }) => "hello from a")
  .function("b", () => "hello from b")

const goodbye = q.router()
  .function("a", () => "goodbye from a")
  .function("b", () => "goodbye from b")

export const router = q.router()
  .router("hello", hello)
  .router("goodbye", goodbye)

```

And the client:

```JavaScript

// client.ts

import { q } from "./q";

const client = q.client(process.env.SERVER_ADDRESS);

await client.hello.a(); // { data: "hello from a" }
await client.hello.b(); // { data: "hello from b" }
await client.goodbye.a(); // { data: "goodbye from a" }
await client.goodbye.b(); // { data: "goodbye from b" }
```

### TypeScript!

Everything you've seen so far becomes fully type-safe with one simple addition: you must provide your backend's type to the client. Thankfully, this is super easy:

```TypeScript

// router.ts

import { q } from "./q";

const router = q.router()
  .function("a", (i: { name: string }) => `hello, ${i.name}`)
  .function("b", () => "hello from b")

// Export the type of the router

export type Router = typeof router;

q.serve(router);

```

And pass the Router type to your client:

```TypeScript

// client.ts

import type { Router } from "./router";
import { q } from "./q";

// Notice the generic here.

const client = q.client<Router>(process.env.SERVER_ADDRESS);

```

Now your client is type-safe! If you try to call a function that doesn't exist, you'll get a TypeScript error, if you pass the wrong arguments, you'll get a TypeScript error, and the return value's `data` field will be correctly typed!

### Middleware

`quiver` supports a simple but powerful type-safe middleware API. A `QuiverMiddleware` is ultimately a function that reads from and writes to a context object. Here's a couple extremely simple middleware:

```JavaScript

// middleware.ts

import { q } from "./q";

const logger = q.middleware(ctx => {
  console.log(ctx);
});

const timestamp = q.middleware(ctx => {
  return {
    timestamp: Date.now(),
  };
});

```

To use a middleware in your server, you attach it to a `QuiverRouter` or `QuiverFunction`:

```JavaScript

import { logger } from "./middleware";

const router = q.router()
  .use(logger)
  .function("a", () => "a")
  .function("b", () => "b")

```

`quiver`'s middleware system is type-safe. If you try to bind incompatible routes to a router with middleware, you'll get a TypeScript error:

```TypeScript

import { q } from "./q";

const passesAString = q.middleware(ctx => {
  return {
    a: "a",
  };
});

const needsANumber = (i: undefined, ctx: { a: number }) => {
  // ...
}

const router = q.router()
  .use(passesAString)
  // Boom! TypeScript error!
  .function("a", needsANumber)

```

#### Merging Middleware

Middleware can be merged in a type-safe manner using `mw.extend(other)` and `mw.pipe(other)`. `extend` can be thought of as "parallel merge" and `pipe` can be thought of as "sequential merge". Some examples:

```TypeScript

import { q } from "./q";

const a = q.middleware(() => {
  return { a: Math.random(), };
});

const b = q.middleware(() => {
  return { b: Math.random(), };
});

const sum = q.middleware((ctx: { a: number, b: number }) => {
  return {
    sum: ctx.a + ctx.b,
  };
});

export const merged = a.extend(b).pipe(sum);

```

## API Reference

__TODO__

### `Quiver`

### `QuiverClient`

### `QuiverRouter`

### `QuiverMiddleware`

### `QuiverProvider`

## Off-the-Shelf Middlewares

From the `quiver` team:

__TODO__

From the community:

__TODO__

## Advanced Examples

__TODO__

Check out these runnable examples:

- Hello, world!
- Using quiver with [React](https://react.dev)
- ENS authentication
- Peer-to-peer, serverless Tic-Tac-Toe
- Type-Safety

If you have a use-case in mind, and are wondering how it might work, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

## Under the Hood

__TODO__

`Quiver` is built on top of the superb [XMTP](https://xmtp.org) messaging protocol. XMTP provides out-of-the-box end-to-end encrypted messaging.

## Roadmap

__TODO__

Right now we're currently on the _path to v0._

If you have a feature (or bugfix) request, don't hesitate to [open an issue](TODO) or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.


