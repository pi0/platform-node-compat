import handler from "./_handler.mjs";

// https://vercel.com/docs/functions/edge-middleware/edge-runtime#compatible-node.js-modules

// import _async_hooks from "node:async_hooks"
// import _events from "node:events"
// import _buffer from "node:buffer"
// import _assert from "node:assert"
// import _util from "node:util"

const nodeModules = {
  // "node:async_hooks": _async_hooks,
  // "node:events": _events,
  // "node:buffer": _buffer,
  // "node:assert": _assert,
  // "node:util": _util
}

globalThis.getVercelBuiltinModule = (specifier) => nodeModules[specifier]

export default function (req) {
  return handler(req);
}
