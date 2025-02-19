# Platform Node.js compat

Cloudflare Workers, Deno Deploy, Netlify Edge, and Vercel Edge middleware are not Node.js but partially implemented native Node.js compatibility.

Keeping track of what is available and what is not, is not an easy task as exact native coverage is barely documented.

This test suite compares available globals and Node.js built-in modules in a live **production** deployment of each platform with the latest Node.js LTS.

Using this data, we can make "hybrid" presets with [unjs/unenv](https://github.com/unjs/unenv), combining userland polyfills with what is available.

This repo was made to develop hybrid presets for [Nitro](https://nitro.build).

## Reports

> [!IMPORTANT]
> The computed data has not been verified and may be inaccurate.

- Cloudflare workers: https://platform-node-compat.pi0.workers.dev/
- Deno deploy: https://platform-node-compat.deno.dev/
- Vercel edge: https://platform-node-compat.vercel.app/
- Netlify edge: https://platform-node-compat.netlify.app/
