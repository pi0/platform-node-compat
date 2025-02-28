import nodeCompat from "./_node-compat.mjs";

const links = {
  "Cloudflare Workers": "https://platform-node-compat.pi0.workers.dev/",
  "Deno Deploy": "https://platform-node-compat.deno.dev/",
  "Netlify Edge": "https://platform-node-compat.netlify.app/",
  "Vercel Edge": "https://platform-node-compat.vercel.app/",
  "GitHub": "https://github.com/pi0/platform-node-compat"
}

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
    const realModule = globalThis.getVercelBuiltinModule?.(`node:${id}`) || await import(`node:${id}`).catch(() => false);
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
