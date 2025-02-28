import handler from "./index.mjs";

Deno.serve((req) => handler(req));
