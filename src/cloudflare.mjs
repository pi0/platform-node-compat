import handler from "./index.mjs";

export default {
  async fetch(request) {
    return handler(request);
  },
};
