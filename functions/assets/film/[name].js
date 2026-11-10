// Cloudflare Pages only. Pages serves static files without byte ranges (always 200 with the whole
// file), but Safari asks for ranges and needs 206 answers to play video. This answers range requests
// for the film videos by streaming just the requested bytes of the static file. The static file has
// no Content-Length here, so the sizes come from _film-sizes.json, written by scripts/build-dist.mjs.
import SIZES from "../../_film-sizes.json";

export async function onRequest({ request, next, params }) {
  const res = await next();
  if (request.method !== "GET" || res.status !== 200 || !res.body) return res;
  const size = SIZES[params.name] || Number(res.headers.get("Content-Length"));
  const range = /^bytes=(\d*)-(\d*)$/.exec((request.headers.get("Range") || "").trim());
  const headers = new Headers(res.headers);
  headers.set("Accept-Ranges", "bytes");
  if (size) headers.set("Content-Length", String(size));
  if (!range || !size || (range[1] === "" && range[2] === "")) return new Response(res.body, { status: 200, headers });

  let start, end;
  if (range[1] === "") { start = Math.max(0, size - Number(range[2])); end = size - 1; }      // bytes=-N: the last N
  else { start = Number(range[1]); end = range[2] === "" ? size - 1 : Math.min(Number(range[2]), size - 1); }
  if (start >= size || start > end) {
    res.body.cancel();
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  // A fixed-length stream keeps the Content-Length header on the streamed answer.
  const { readable, writable } = new FixedLengthStream(end - start + 1);
  slice(res.body, start, end + 1).pipeTo(writable).catch(() => {});
  return new Response(readable, { status: 206, headers });
}

// Pass through only bytes [from, to) of the stream.
function slice(body, from, to) {
  let pos = 0;
  return body.pipeThrough(new TransformStream({
    transform(chunk, ctl) {
      const a = Math.max(from - pos, 0), b = Math.min(to - pos, chunk.byteLength);
      pos += chunk.byteLength;
      if (b > a) ctl.enqueue(chunk.subarray(a, b));
      if (pos >= to) ctl.terminate();
    },
  }));
}
