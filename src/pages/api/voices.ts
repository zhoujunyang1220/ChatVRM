import http from "http";
import https from "https";
import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://Zjy1220-chatvrm-backend.hf.space";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!BACKEND_URL) {
    return res.status(502).json({ error: "No backend URL configured" });
  }

  const url = new URL(BACKEND_URL);
  const isHttps = url.protocol === "https:";
  const transport = isHttps ? https : http;

  const options: http.RequestOptions = {
    hostname: url.hostname,
    port: url.port ? parseInt(url.port) : isHttps ? 443 : 80,
    path: "/voices",
    method: "GET",
    agent: false,
    timeout: 10000,
  };

  return new Promise<void>((resolve) => {
    const proxyReq = transport.request(options, (proxyRes) => {
      const chunks: Buffer[] = [];
      proxyRes.on("data", (chunk) => chunks.push(chunk));
      proxyRes.on("end", () => {
        const data = Buffer.concat(chunks);
        res.setHeader("Content-Type", "application/json");
        res.status(proxyRes.statusCode || 200);
        res.end(data);
        resolve();
      });
    });

    proxyReq.on("error", (err) => {
      console.error("Voices proxy error:", err);
      res.status(502).json({ error: "Backend connection failed" });
      resolve();
    });

    proxyReq.on("timeout", () => {
      proxyReq.destroy();
      res.status(504).json({ error: "Backend timeout" });
      resolve();
    });

    proxyReq.end();
  });
}
