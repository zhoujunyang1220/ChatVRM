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
    path: "/tts",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
    agent: false,
  };

  return new Promise<void>((resolve) => {
    const proxyReq = http.request(options, (proxyRes) => {
      const chunks: Buffer[] = [];
      proxyRes.on("data", (chunk) => chunks.push(chunk));
      proxyRes.on("end", () => {
        const audio = Buffer.concat(chunks);
        res.setHeader("Content-Type", proxyRes.headers["content-type"] || "audio/wav");
        res.status(proxyRes.statusCode || 200);
        res.end(audio);
        resolve();
      });
    });

    proxyReq.on("error", (err) => {
      console.error("TTS proxy error:", err);
      res.status(502).json({ error: "Backend connection failed" });
      resolve();
    });

    proxyReq.write(body);
    proxyReq.end();
  });
}
