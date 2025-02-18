import handler from "../index.mjs";

export default function (request) {
  return handler(request);
}

export const config = {
  path: "/**",
};
