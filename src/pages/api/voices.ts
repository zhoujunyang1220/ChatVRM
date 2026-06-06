import http from "http";
import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_HOST = "localhost";
const BACKEND_PORT = 8002;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const options: http.RequestOptions = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: "/voices",
    method: "GET",
    agent: false,
  };

  return new Promise<void>((resolve) => {
    const proxyReq = http.request(options, (proxyRes) => {
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

    proxyReq.end();
  });
}
