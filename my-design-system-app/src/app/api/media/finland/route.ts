import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { Readable } from "node:stream";

const VIDEO_PATH = resolve(process.cwd(), "..", "finland1-web.mp4");
const CHUNK_SIZE = 1024 * 1024 * 2;

function createNotFoundResponse() {
  return new Response("Video not found", { status: 404 });
}

export async function HEAD() {
  if (!existsSync(VIDEO_PATH)) {
    return createNotFoundResponse();
  }

  const stats = statSync(VIDEO_PATH);

  return new Response(null, {
    status: 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(stats.size),
      "Content-Type": "video/mp4",
    },
  });
}

export async function GET(request: Request) {
  if (!existsSync(VIDEO_PATH)) {
    return createNotFoundResponse();
  }

  const stats = statSync(VIDEO_PATH);
  const range = request.headers.get("range");

  if (!range) {
    const stream = Readable.toWeb(createReadStream(VIDEO_PATH)) as ReadableStream;

    return new Response(stream, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(stats.size),
        "Content-Type": "video/mp4",
      },
    });
  }

  const matches = /bytes=(\d+)-(\d*)/.exec(range);
  if (!matches) {
    return new Response("Invalid range", { status: 416 });
  }

  const start = Number.parseInt(matches[1], 10);
  const requestedEnd = matches[2] ? Number.parseInt(matches[2], 10) : start + CHUNK_SIZE - 1;
  const end = Math.min(requestedEnd, stats.size - 1, start + CHUNK_SIZE - 1);

  if (Number.isNaN(start) || Number.isNaN(end) || start >= stats.size || start > end) {
    return new Response("Range not satisfiable", {
      status: 416,
      headers: {
        "Content-Range": `bytes */${stats.size}`,
      },
    });
  }

  const stream = Readable.toWeb(createReadStream(VIDEO_PATH, { start, end })) as ReadableStream;

  return new Response(stream, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${stats.size}`,
      "Content-Type": "video/mp4",
    },
  });
}
