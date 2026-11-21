import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const cli = process.argv.slice(2);
const port = Number(cli.find((argument) => !argument.startsWith("--")) ?? 4173);
const root = fileURLToPath(new URL("../out/", import.meta.url));
const autoOpen = cli.includes("--open") && process.platform === "win32";
let listeningPort = port;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".glb": "model/gltf-binary",
  ".wasm": "application/wasm",
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Informe uma porta de 1 a 65535.");
  process.exit(1);
}

try {
  await stat(resolve(root, "index.html"));
} catch {
  console.error("A prévia ainda não foi gerada. Execute npm run build na pasta do projeto.");
  process.exit(1);
}

async function findFile(pathname) {
  const file = resolve(root, "." + decodeURIComponent(pathname));
  const localPath = relative(root, file);
  if (isAbsolute(localPath) || localPath === ".." || localPath.startsWith(".." + sep)) return null;
  try {
    const entry = await stat(file);
    if (entry.isDirectory()) {
      const index = resolve(file, "index.html");
      return (await stat(index)).isFile() ? index : null;
    }
    return entry.isFile() ? file : null;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const url = new URL(request.url ?? "/", "http://" + host);
    const file = await findFile(url.pathname);
    const body = file ?? resolve(root, "404.html");
    response.writeHead(file ? 200 : 404, {
      "Content-Type": mimeTypes[extname(body)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(body).on("error", () => response.destroy()).pipe(response);
  } catch {
    response.writeHead(400).end();
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && autoOpen && listeningPort < Math.min(port + 9, 65535)) {
    listeningPort += 1;
    server.listen(listeningPort, host);
    return;
  }
  console.error(error.code === "EADDRINUSE" ? "Esta porta está em uso. Tente npm run preview -- 4174." : error.message);
  process.exitCode = 1;
});

server.on("listening", () => {
  const url = "http://" + host + ":" + listeningPort + "/";
  console.log("Appl.Oz · prévia local em " + url);
  if (autoOpen) {
    const browser = spawn("rundll32.exe", ["url.dll,FileProtocolHandler", url], { detached: true, stdio: "ignore", windowsHide: true });
    browser.on("error", () => console.log("Abra o endereço acima no navegador."));
    browser.unref();
  }
});
server.listen(listeningPort, host);
