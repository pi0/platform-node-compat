import handler from "./_handler.mjs";

export default {
  async fetch(request) {
    return handler(request);
  },
};
