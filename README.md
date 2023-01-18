# dQuery

dQuery is a jQuery-like library for Deno that allows you to manipulate the DOM
using Deno DOM

## Usage

```ts
import * as dq from "https://deno.land/x/dquery/mod.ts";

const $ = dq.load(`<h1>Hello World</h1>`);
console.log($("h1").text); // Hello World
```
