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
  <a href="https://github.com/killthebuddh4/quiver#api-reference">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/TODO">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/TODO">npm</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/killthebuddh4/quiver/issues/new">Issues</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/killthebuddh4_">@killthebuddha_</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/killthebuddh4/fig">fig</a>
  <br />
</div>

## Overview

`quiver` is a dead-simple 😵, secure 🔐, type-safe 🦄 RPC library powered by [XMTP](https://xmtp.org) (and inspired by [trpc](https://trpc.io)).

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Install](#install)
- [Quickstart](#quickstart)
- [Examples](#examples)
- [API Reference](#api-reference)
    - [createQuiver](#createquiver)
    - [createFunction](#createfunction)
    - [createRouter](#createrouter)
    - [createClient](#createclient)
    - [createMiddleware](#createmiddleware)
- [Middleware](#middleware)
- [How does it work?](#how-does-it-work)
- [Roadmap](#roadmap)
    - [TODO](#todo)

## Install

`npm install @killthebuddha/quiver`

## Quickstart

First create a `QuiverFunction`:

```JavaScript
// api.ts

import { createFunction } from "@killthebuddha/quiver";

export const hello = createFunction({
  auth: async () => true,
  handler: async () => "Hello!",
})
```

Then serve it:

```JavaScript
// server.ts
import { createQuiver } from "@killthebuddha/quiver";
import * as api from "./api.js";

const quiver = createQuiver({});

quiver.router(api);

console.log(`Running quiver at ${server.address}`)

quiver.start();
```

And that's it 🎉, you've just __deployed a service to the internet in ~10 lines of code!__

It's just as easy to call your service:

```JavaScript
// client.ts
import { createQuiver } from "@killthebuddha/quiver";
import * as api from "./api.js";

const quiver = createQuiver({});

const client = quiver.client(api, {
  address: "YOUR_SERVER_ADDESS"
});

const message = await client.hello();

console.log(message.data);
```

And a bonus for all the TypeScript developers (🦾) out there: _everything above is automagically ✨ and fully type-safe !_

TODO: Maybe a `gif` here to show the type-safety?

## Examples

Check out these runnable examples:

(TODO)

- Hello, world!
- Using quiver with [React](https://react.dev)
- ENS authentication
- Peer-to-peer, serverless Chess
- Type-Safety

If you have a use-case in mind, and are wondering how it might work, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

## API Reference

#### createQuiver

#### createFunction

#### createRouter

#### createClient

#### createMiddleware

## Middleware

A middleware should be able to:

- return
- throw
- exit
- mutate

Quiver (router)

- middleware
- message
- check the path
- check the json
- check the request
- middleware
- pass to router
- middleware
- pass to function
- middleware
- parse inputs
- call handler
- return value
- publish value

Function

- parse input
- create context
- call function

Client

- send request
- set handler
- wait for inbound
- inbound
- get response resolver
- parse output
- return value

Send

- serialize output
- sent response

[A, B] -> C

[D, E] -> B

A -> B -> C

quiver.use(
  "target",
  "event",
  "name",
  handler
)

quiver.after(
  "target",
  "name",
  handler,
)

quiver.throw.use(
  "target",
  "event",
  "name",
  handler
)

quiver.return.use(
  "target",
  "event",
  "name",
  handler
)

quiver.exit.use(
  "target",
  "event",
  "name",
  handler
)

quiver.router.use(
  "target",
  "event",
  "name",
  handler
)

quiver.send.use(
  "target",
  "event",
  "name",
  handler
)





quiver.throw.before(
  "target",
  "name",
  handler
)

quiver.return.before(
  "target",
  "name",
  handler
)

router.use(
  "name",
  "target",
  "event",
  handler,
)

router.use(
  "name",
  "target",
  "event",
  handler,
)



router.trace(
  router.hooks,
  router.events,
  ctx => {
  }
)

router.hooks.replace(
  "target",
  "name",
)


QM => Ctx | Return | Throw












## How does it work?

`Quiver` is built on top of the superb [XMTP](https://xmtp.org) messaging protocol. XMTP provides out-of-the-box end-to-end encrypted messaging.

## Roadmap

If you have a feature (or bugfix) request, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

#### TODO

Ok so we're at a nice v0. The middleware API is type-safe (haven't worked out the buges yet though), the routing works, and the client proxy works. The next steps are (in roughly chronological order)

- exit/throw/return control flow
  - DONE, needs testing
- basic options, logging, errors
  - DONE, needs testing
- iron out the namespace + path stuff
  -  DONE, needs testing
- debug the middleware system
- test the start/stop functionality
- write tests for each of the basic cases (function/router/function w/ middleware, etc)
- write a couple useful middlewares
  - proxy
  - ens
- clean up the relationship between types/quiver/classes
- update the README
- add a system for notifying subscribers when parents fail

I really really really want this to be done by EOD tomorrow.


NOTE

- test each of the base case for each kind of QuiverError
- i think we have a bug related to root paths. i don't think we handle 100% of
  - root is a function
  - root is a router, no path
  - root is a router, with path