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

## How does it work?

`Quiver` is built on top of the superb [XMTP](https://xmtp.org) messaging protocol. XMTP provides out-of-the-box end-to-end encrypted messaging.

## Roadmap

If you have a feature (or bugfix) request, don't hesitate to [open an issue](TODO), join the [discord](TODO), or DM [@killthebuddha_](https://x.com/killthebuddha_) on X.

#### TODO

- middleware
  - lifecycle
  - return/throw + middleware
  - override/extend
- parser plugins (just middleware)
- function and nested router apis