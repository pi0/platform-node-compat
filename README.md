# Platform Node.js compat

Edge runtimes, including Cloudflare Workers, Deno Deploy, Netlify edge and Vercel edge middleware are not Node.js but partially implemented (platform) native Node.js compatibility.

Keeping track of what is available and what is not, is often hard. This test suite, compares available globals and Node.js built-in modules in **production** deployment of each platform with latest Node.js LTS.

Using this data, we can make "hybrid" presets with [unjs/unenv](https://github.com/unjs/unenv), combining userland polyfills with what is really available.

This repo was made to develop this hybrid preets for [Nitro](https://nitro.dev).

> [!IMPORTANT]
> Don't rely on data, they might be inaccurate!

## Deployments

https://platform-node-compat.pi0.workers.dev/

https://platform-node-compat.deno.dev/

https://platform-node-compat.vercel.app/

https://platform-node-compat.netlify.app/
