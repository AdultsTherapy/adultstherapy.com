"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(process.argv[2] || process.cwd());
const port = Number(process.argv[3] || 8765);

const contentTypes = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
});

const resolveRequest = (requestUrl) => {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  const relativePath = pathname.replace(/^\/+/, "");
  return path.resolve(root, relativePath || "index.html");
};

const resolveFile = (candidate, callback) => {
  fs.stat(candidate, (error, stats) => {
    if (error) return callback(error);
    callback(null, stats.isDirectory() ? path.join(candidate, "index.html") : candidate);
  });
};

const sendFile = (request, response, filePath, statusCode = 200) => {
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      if (statusCode === 404) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      sendFile(request, response, path.join(root, "404.html"), 404);
      return;
    }

    response.writeHead(statusCode, {
      "content-length": stats.size,
      "content-type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(filePath).pipe(response);
  });
};

const server = http.createServer((request, response) => {
  try {
    const candidate = resolveRequest(request.url);
    if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }
    resolveFile(candidate, (error, filePath) =>
      error ? sendFile(request, response, path.join(root, "404.html"), 404) : sendFile(request, response, filePath),
    );
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad request");
  }
});

server.listen(port, "127.0.0.1");
