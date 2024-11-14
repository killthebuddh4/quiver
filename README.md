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
    - [`Quiver`](#quiver)
    - [`QuiverRouter`](#quiverrouter)
    - [`QuiverClient`](#quiverclient)
    - [`QuiverProvider`](#quiverprovider)
    - [`QuiverMiddleware`](#quivermiddleware)
- [Middleware](#middleware)
    - [mw.extend (parallel merge)](#mwextend-parallel-merge)
    - [mw.pipe (serial merge)](#mwpipe-serial-merge)
- [How does it work?](#how-does-it-work)
- [Roadmap](#roadmap)
    - [Basic Middleware Test Cases](#basic-middleware-test-cases)
    - [Basic Control Flow Test Cases](#basic-control-flow-test-cases)
    - [Basic End-to-End Test Cases](#basic-end-to-end-test-cases)
    - [Document How](#document-how)
    - [Useful Middlewares](#useful-middlewares)

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
- Peer-to-peer, serverless Tic-Tac-Toe
- Type-Safety

If you have a use-case in mind, and are wondering how it might work, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

## API Reference

#### `Quiver`

#### `QuiverRouter`

#### `QuiverClient`

#### `QuiverProvider`

#### `QuiverMiddleware`

## Middleware

An app built with `quiver` is essentially a tree where each non-leaf node is a `QuiverRouter` and each leaf node is a `QuiverFunction` and every node optionally includes a `QuiverMiddleware`. When an app receives a request, a `QuiverContext` is created and passed to the root node. Each node's middleware adds key-value pairs to the context and then passes it to the next node. Quiver provides type-safe functions for creating nodes and trees.

Every middleware is essentially a function that implements the signature `(ctx: CtxIn) => CtxOut` where `CtxIn` always extends `QuiverContext` and `CtxOut` always extends `CtxIn`. As a context is passed from node to node, it becomes and bigger-and-bigger and more-and-more-narrowed version of the original.

Quiver provides type-safe functions for constructing middleware nodes and trees. Middlewares are instantiated with `q.middleware(fn)` and merged using `mw.extend(next)` and `mw.pipe(next)`. `mw.extend` can be thought of as "parallel merge" and `mw.pipe` can be thought of as "serial merge". Middleware trees are constructed by first converting a bare node to a router using `mw.router()` and then adding children to the router using `router.use(key, next)`.

Quiver's middleware functions construct middleware according to a set of rules. Some of the rules involve input/output types and are enforced by the `TypeScript` compiler while others involve control flow and are enforced at runtime. It's important to understand these rules, the rest of this section is dedicated to explaining them in detail.


#### mw.extend (parallel merge)

The extend operation `lhs.extend(rhs)` is valid when:

- `lhs` and `rhs` do not write to any of the same keys, and
- any key which both `lhs` and `rhs` read from have compatible types (one extends the other).

The extend operation `lhs.extend(rhs)` produces a new middleware with new `ReadsKeys` and `WritesKeys` types. The `ReadsKeys` type is the intersection of the two inputs' `ReadsKeys` types. The `WritesKeys` type is the intersection of the two inputs' `WritesKeys` types.

#### mw.pipe (serial merge)

The pipe operation `lhs.pipe(rhs)` is valid when the `lhs` provides a context that is compatible with the `rhs`'s input. The provided context _is not_ simply the `lhs`'s `WritesKeys` type because the middleware engine passes the entire context from `lhs` to `rhs`. The provided context is constructed by the `lhs` when `lhs` is executed. The `lhs` receives a record that looks like `ReadsKeys` and then writes to it according to the `WritesKeys` type. So, the provided context's type is:

- Any key in `lhs`'s `WritesKeys`, plus
- any key in `lhs`'s `ReadsKeys` that is not in `rhs`'s `WritesKeys`.

_Note that the provided type is NOT exactly the same as `ReadsKeys & WritesKeys` because the `rhs` may overwrite keys with different types of data._

The provided context is compatible with `rhs` as long as there are no incompatible keys. The provided context does not need to provide all keys, it only needs to not provide incompatible keys.

## How does it work?

`Quiver` is built on top of the superb [XMTP](https://xmtp.org) messaging protocol. XMTP provides out-of-the-box end-to-end encrypted messaging.

## Roadmap

Right now we're currently on the _path to v0._

If you have a feature (or bugfix) request, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

#### Basic Middleware Test Cases


  - type signatures, constructed return types, execution values


- extend



  - defined -> undefined
  - defined -> defined
    - disjoint
    - overlapping
  - undefined -> undefined
  - undefined -> defined

  - lhs defined, lhs undefined
  - rhs defined, rhs undefined
  - inputs disjoint, overlapping

- pipe
  - 
  - type signatures, constructed return types, execution values
  - lhs defined, lhs undefined
  - rhs defined, rhs undefined
  - rhs input overlaps input, output, both, neither

- use
  - type signatures, constructed return types, execution values
  - lhs defined, lhs undefined
  - rhs defined, rhs undefined
  - overlap input, output, both, neither

#### Basic Control Flow Test Cases

- early throw
- early exit
- early return
- throw
- exit
- return

#### Basic End-to-End Test Cases

- root function without middleware
- root function with middleware
- root router without middleware
- root router with middleware
- 3-layer with middleware

#### Document How

- core api
  - fluent api
  - basic examples
  - control flow works
  - middleware
  - (hooks coming soon)
  - function
  - router
  - app
  - provider
  - logging
- middleware works
  - fluent api
  - type signatures
  - constructed types
- client works
  - types
  - fetching

#### Useful Middlewares

- ens
- proxy