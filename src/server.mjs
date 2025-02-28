import { serve } from "srvx";
import handler from "./index.mjs";

const server = serve({
  fetch: (req) => handler(req),
});

await server.ready();

console.log(`🚀 Server listening on ${server.url}`);
