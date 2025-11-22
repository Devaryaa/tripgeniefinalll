import express, { type Express, type Request, type Response, type NextFunction } from "express";
import type { Server } from "http";
import type { ServerOptions, ViteDevServer } from "vite";
import fs from "fs";
import path from "path";

const getServerOptions = () => {
  const options: ServerOptions = {
    host: "0.0.0.0",
    port: 5000,
    hmr: {
      clientPort: 443,
    },
  };
  return options;
};

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await (
    await import("vite")
  ).createServer({
    ...getServerOptions(),
    server: {
      middlewareMode: true,
      ...getServerOptions(),
      hmr: { server },
    },
    appType: "custom",
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
  });

  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientPath = path.resolve(process.cwd(), "client");
      const template = await fs.promises.readFile(
        path.resolve(clientPath, "index.html"),
        "utf-8"
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  app.use((_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
