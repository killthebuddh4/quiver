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

`quiver` is a dead-simple 😵, secure 🔐, type-safe 🦄 RPC client and server powered by [XMTP](https://xmtp.org).

## Quickstart

1. Install `quiver`.

`npm install @killthebuddha/quiver` or `yarn add @killthebuddha/quiver` or `pnpm add @killthebuddha/quiver`

2. Serve a function.

```JavaScript
// server.ts

import quiver from "@killthebuddha/quiver";
import { hello } from "./hello.js";
import { xmtp } from "./xmtp.js";

const q = quiver.q();
q.serve("answer", () => 42);
```

3. Call the function.

```JavaScript
// client.ts

import quiver from "@killthebuddha/quiver";

const q = quiver.q();
const client = q.client("answer", "0xYourAddress");
const answer = await client();
console.log(answer.data); // 42
```

And that's it 🎉, you've just __deployed a service to the internet, and called that service, in ~10 lines of code!__ For more advanced examples, see the [Example Usage](#example-usage) or [Advanced Examples](#advanced-examples) sections.

## Table of Contents

- [Overview](#overview)
- [Quickstart](#quickstart)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [API Reference](#api-reference)
    - [`QuiverClient`](#quiverclient)
    - [`QuiverRouter`](#quiverrouter)
    - [`QuiverMiddleware`](#quivermiddleware)
    - [`QuiverProvider`](#quiverprovider)
    - [Off-the-Shelf Middlewares](#off-the-shelf-middlewares)
- [Example Usage](#example-usage)
- [Advanced Examples](#advanced-examples)
- [Under the Hood](#under-the-hood)
- [Roadmap](#roadmap)
- [Community](#community)

## Features

`quiver` is an extremely simple way to rapidly build and deploy services to the internet. It's powered by [XMTP](https://xmtp.org) and inspired by [trpc](https://trpc.io).

- __Type-Safe Client/Server__
- __Type-Safe Middleware__
- __Fluent builder APIs__
- __End-to-End Encryption__
- __Dead-Simple__

## API Reference

#### `QuiverClient`

#### `QuiverRouter`

#### `QuiverMiddleware`

#### `QuiverProvider`

#### Off-the-Shelf Middlewares

From the `quiver` team:

__TODO__

From the community:

__TODO__

## Example Usage

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

If you have a feature (or bugfix) request, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

## Community

__TODO__

