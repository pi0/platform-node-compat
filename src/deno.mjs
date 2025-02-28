import handler from "./_handler.mjs";

Deno.serve((req) => handler(req));
