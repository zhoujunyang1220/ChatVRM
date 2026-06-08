import http from "http";
import https from "https";
import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://Zjy1220-chatvrm-backend.hf.space";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (!BACKEND_URL) {
    return res.status(502).json({ error: "No backend URL configured" });
  }

  const url = new URL(BACKEND_URL);
  const isHttps = url.protocol === "https:";
  const transport = isHttps ? https : http;

  const body = JSON.stringify(req.body);

  const options: http.RequestOptions = {
    hostname: url.hostname,
    port: url.port ? parseInt(url.port) : isHttps ? 443 : 80,
    path: "/chat",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
    agent: false,
    timeout: 90000,
  };

  return new Promise<void>((resolve) => {
    const proxyReq = transport.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });

      proxyRes.on("data", (chunk) => res.write(chunk));
      proxyRes.on("end", () => {
        res.end();
        resolve();
      });
    });

    proxyReq.on("error", (err) => {
      console.error("Chat proxy error:", err);
      res.status(502).json({ error: "Backend connection failed" });
      resolve();
    });

    proxyReq.on("timeout", () => {
      proxyReq.destroy();
      res.status(504).json({ error: "Backend timeout" });
      resolve();
    });

    proxyReq.write(body);
    proxyReq.end();
  });
}
