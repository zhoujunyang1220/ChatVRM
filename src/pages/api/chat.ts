import http from "http";
import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_HOST = "localhost";
const BACKEND_PORT = 8002;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const body = JSON.stringify(req.body);

  const options: http.RequestOptions = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: "/chat",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
    agent: false,
  };

  return new Promise<void>((resolve) => {
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, {
        "Content-Type": "text/event-stream",
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

    proxyReq.write(body);
    proxyReq.end();
  });
}
