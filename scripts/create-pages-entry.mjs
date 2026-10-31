import { copyFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicDir = ".output/public";
const assetsDir = join(publicDir, "assets");
const assets = await readdir(assetsDir);
const javascript = assets.find((name) => /^index-.*\.js$/.test(name));
const stylesheet = assets.find((name) => /^index-.*\.css$/.test(name));

if (!javascript || !stylesheet) {
  throw new Error("Pages build did not produce the client entry assets.");
}

// Match the base path used by vite.github-pages.config.ts so asset URLs
// resolve on project sites served at /<repo>/.
const repository = process.env["GITHUB_REPOSITORY"]?.split("/")[1];
const isUserSite = repository?.endsWith(".github.io");
const base =
  process.env["GITHUB_ACTIONS"] && repository && !isUserSite ? `/${repository}/` : "/";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Eco Fuel turns waste plastic into useful fuel products." />
    <title>Eco Fuel</title>
    <script type="module" crossorigin src="${base}assets/${javascript}"></script>
    <link rel="stylesheet" crossorigin href="${base}assets/${stylesheet}" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

await writeFile(join(publicDir, "index.html"), html);
await copyFile(join(publicDir, "index.html"), join(publicDir, "404.html"));
