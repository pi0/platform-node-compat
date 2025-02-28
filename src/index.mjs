import nodeCompat from "./node-compat.mjs";

const links = {
  "Cloudflare Workers": "https://platform-node-compat.pi0.workers.dev/",
  "Deno Deploy": "https://platform-node-compat.deno.dev/",
  "Netlify Edge": "https://platform-node-compat.netlify.app/",
  "Vercel Edge": "https://platform-node-compat.vercel.app/",
  "GitHub": "https://github.com/pi0/platform-node-compat"
}

import _http_agent from "_http_agent"
import _http_client from "_http_client"
import _http_common from "_http_common"
import _http_incoming from "_http_incoming"
import _http_outgoing from "_http_outgoing"
import _http_server from "_http_server"
import _stream_duplex from "_stream_duplex"
import _stream_passthrough from "_stream_passthrough"
import _stream_readable from "_stream_readable"
import _stream_transform from "_stream_transform"
import _stream_wrap from "_stream_wrap"
import _stream_writable from "_stream_writable"
import _tls_common from "_tls_common"
import _tls_wrap from "_tls_wrap"
import assert_ from "assert"
import assert_strict from "assert/strict"
import async_hooks from "async_hooks"
import buffer from "buffer"
import child_process from "child_process"
import cluster from "cluster"
import console from "console"
import constants from "constants"
import crypto from "crypto"
import dgram from "dgram"
import diagnostics_channel from "diagnostics_channel"
import dns from "dns"
import dns_promises from "dns/promises"
import domain from "domain"
import events from "events"
import fs from "fs"
import fs_promises from "fs/promises"
import http from "http"
import http2 from "http2"
import https from "https"
import inspector from "inspector"
import inspector_promises from "inspector/promises"
import module from "module"
import net from "net"
import os from "os"
import path from "path"
import path_posix from "path/posix"
import path_win32 from "path/win32"
import perf_hooks from "perf_hooks"
import process from "process"
import punycode from "punycode"
import querystring from "querystring"
import readline from "readline"
import readline_promises from "readline/promises"
import repl from "repl"
import stream from "stream"
import stream_consumers from "stream/consumers"
import stream_promises from "stream/promises"
import stream_web from "stream/web"
import string_decoder from "string_decoder"
import sys from "sys"
import timers from "timers"
import timers_promises from "timers/promises"
import tls from "tls"
import trace_events from "trace_events"
import tty from "tty"
import url from "url"
import util from "util"
import util_types from "util/types"
import v8 from "v8"
import vm from "vm"
import wasi from "wasi"
import worker_threads from "worker_threads"
import zlib from "zlib"

export default async function handler(req) {
  const report = await collectCompat()

  if (req.url.includes("?json")) {
    return new Response(JSON.stringify({ _url: req.url, ...report }, null, 2), {
      headers: {
        "content-type": "application/json"
      }
    });
  }

  const reportHTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Node.js compat test</title>
  <style>
  body {
    margin: 20px;
    font-family: Arial, sans-serif;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    border: 1px solid #222;
  }

  table, th, td {
    border: 1px solid #2b2b2b;
  }

  th, td {
    padding: 12px;
    text-align: left;
    color: black;
  }

  thead th {
    position: sticky;
    top: 0;
    background-color: #2b2b2b;
    color: #ffffff;
    font-weight: bold;
    border-bottom: 2px solid #444444;
  }

  caption {
    padding: 10px;
    font-size: 1.2em;
    font-weight: bold;
    color: #d1d1d1;
  }

  div {
    margin-bottom: 10px;
  }
</style>

</head>
<body>
  <div>
    ${Object.entries(links).map(([name, url]) => /* html */ `<a href="${url}">${name}</a>`).join(" | ")}
  </div>

  <h1>Node.js compat test</h1>

  <div>
    <a href="?json">📤 JSON export</a>
  </div>

  <div style="background-color: #f0f0f0; padding: 10px; border: 1px solid #ccc; margin-bottom: 20px;">
  The computed data has not been verified and may be inaccurate.
  </div>

  <hr/>

  <div>
    Compared against Node.js v${nodeCompat.version}
  </div>

  <div>
    Available runtime globals: ${report.globals.globalKeys.map(name => `<code>${name}</code>`).join(", ")}
  </div>

  <div>
    Missing Node.js globals: ${report.globals.missing.map(name => `<code>${name}</code>`).join(", ") || 'None!'}
  </div>

  <div>
    Features: ${Object.entries(report.features).map(([name, value]) => `${value ? '✅' : '❌'} <code>${name}</code>`).join(" | ")}
  </div>

  <table>
    <thead>
      <tr>
        <th>Node.js module</th>
        <th>Missing exports</th>
        <th>Available exports</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(report.builtinModules).map(([id, compat]) => {
    if (compat === false) {
      return /* html */ `
        <tr style="background-color: #ffcccc;">
        <td><code>node:${id}</code></td>
        <td colspan=2><small>not available</small></td>
        </tr>
      `
    }
    const hasMissingExports = compat.missingExports.length > 0
    return /* html */ `
        <tr style="background-color: ${hasMissingExports ? '#ffffcc' : '#ccffcc'};">
          <td><code>node:${id}</code></td>
          <td>${fmtList(compat.missingExports, !["constants", "process"].includes(id))}</td>
          <td style="background-color: #ccffcc;">${fmtList(compat.exports)}</td>
        </tr>
      `
  }).join("")}
    </tbody>
  </table>
</body>
  `

  return new Response(reportHTML, { headers: { "content-type": "text/html" } });
}

async function collectCompat() {
  const report = { version: nodeCompat.version, builtinModules: {}, globals: {}, features: {} }

  report.globals.globalKeys = Object.getOwnPropertyNames(globalThis).sort()
  report.globals.missing = nodeCompat.globals.globalKeys.filter((name) => !(name in globalThis) && !globalThis[name]).sort()

  report.features['process.getBuiltinModule'] = runTest(() => globalThis.process?.getBuiltinModule("process"))

  for (const [id, compat] of Object.entries(nodeCompat.modules)) {
    const realModule = await import(`node:${id}`).catch(() => false);
    if (realModule === false) {
      report.builtinModules[id] = false;
      continue;
    }

    const realExports = Object.getOwnPropertyNames(realModule).filter((name) => name !== "default").sort()
    const missingExports = compat.exports.filter((name) => !(name in realModule)).sort()

    report.builtinModules[id] = {
      exports: realExports,
      missingExports
    }
  }
  return report
}

function runTest(fn) {
  try {
    return !!fn()
  } catch (err) {
    console.error(err);
    return false;
  }
}

function fmtList(list, showAll) {
  return !showAll && list.length > 15 ?
    `${list.slice(0, 5).map(i => `<code>${i}</code>`).join(", ")}, <small>...${list.length - 5} more</small>`
    : list.map(i => `<code>${i}</code>`).join(", ")
}
