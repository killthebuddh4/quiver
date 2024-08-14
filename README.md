<p align="center">
  <img src="quiver-logo.png" width="200px" align="center" alt="Quiver logo" />
  <h1 align="center">Quiver</h1>
  <p align="center">
    The <em>quickest way to deploy secure services to the internet</em>.
  </p>
</p>
<br/>
<p align="center">
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/killthebuddh4/quiver" alt="License"></a>
<a href="https://twitter.com/killthebuddha_" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@killthebuddha_-4BBAAB.svg" alt="Created by Colin McDonnell"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/npm/killthebuddha/quiver.svg" alt="npm"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/github/stars/killthebuddh4/quiver" alt="stars"></a>
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

# Overview

`quiver` is a dead-simple 😵, secure 🔐, type-safe 🦄 RPC library powered by [XMTP](https://xmtp.org) (and inspired by [trpc](https://trpc.io)).


# Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Install](#install)
- [Quickstart](#quickstart)
- [Auth](#auth)
- [Examples](#examples)
- [API Reference](#api-reference)
- [How does it work?](#how-does-it-work)
- [Roadmap](#roadmap)

# Install

`npm install @killthebuddha/quiver`

# Quickstart

First create a `QuiverFunction`:

```JavaScript
// api.ts

import { createFunction } from "@killthebuddha/quiver";

export const hello = createFunction({
  auth: async () => true,
  handler: async () => "Hello!",
})
```

Then attach it to a `QuiverServer`:

```JavaScript
// server.ts

import { createServer } from "@killthebuddha/quiver";
import * as api from "./api.js";

const server = await createServer({ api });

// Note this an Ethereum address.
console.log(`Server listening to ${server.address}`)

server.start();
```

And that's it 🎉, you've just __deployed a service to the internet in ~10 lines of code!__

It's just as easy to call your service:

```JavaScript
// client.ts

import { createClient } from "@killthebuddha/quiver";
import * as api from "./api.js";

const client = await createClient({
  api,
  server: { address: "YOUR_SERVER_ADDRESS" }
});

const message = await client.hello();

console.log(message.data);

```

And a bonus for all the TypeScript developers (🦾) out there: _everything above is automagically ✨ and fully type-safe !_

TODO: Maybe a `gif` here to show the type-safety?

# Auth

The function we deployed above is public, but we can _add authentication in just a few lines of code_. Let's modify the `hello` function:

```JavaScript
// api.ts

import { createFunction } from "@killthebuddha/quiver";

const WHITELIST = [
  'YOUR_MOTHERS_ADDRESS',
  'YOUR_BFFS_ADDRESS',
  'YOUR_SECRET_IDENTITY'
];

export const hello = createFunction({
  auth: async (context) => {
    return WHITELIST.includes(context.message.sender.address);
  },
  handler: async () => "Hello!",
})
```

And that's all there is to it 🔥! For something more dynamic, use your favorite database, auth provider, [ENS](https://app.ens.domains), etc.

# Examples

Check out these runnable examples:

(TODO)

- Hello, world!
- Using quiver with [React](https://react.dev)
- ENS authentication
- Peer-to-peer, serverless Chess
- Type-Safety

If you have a use-case in mind, and are wondering how it might work, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

# API Reference

TODO

# How does it work?

`Quiver` is built on top of the superb [XMTP](https://xmtp.org) messaging protocol. XMTP provides out-of-the-box end-to-end encrypted messaging.

# Roadmap

If you have a feature (or bugfix) request, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.