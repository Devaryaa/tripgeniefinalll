import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";

// IMPORTANT: no `.ts` extension
import { registerRoutes } from "./routes";

import { setupVite, serveStatic, log } from "./vite";

dotenv.config();

const app = express();

// CORS setup
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL || "http://localhost:3000"
        : true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging for API calls
app.use((req, res, next) => {
  const start = Date.now();
  let capturedJsonResponse;

  const originalJson = res.json;
  res.json = (data, ...args) => {
    capturedJsonResponse = data;
    return originalJson.call(res, data, ...args);
  };

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${
        Date.now() - start
      }ms`;

      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Register API routes BEFORE Vite
    const server = registerRoutes(app);

    // Global error handler
    app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || 500;
        res.status(status).json({ message: err.message || "Server Error" });
        log(`❌ Error: ${err.message}`);
      }
    );

    const PORT = parseInt(process.env.PORT || "5000", 10);
    const NODE_ENV = process.env.NODE_ENV || "development";

    // DEV: Run Vite Dev Server
    if (NODE_ENV === "development") {
      await setupVite(app, server);
    }
    // PROD: Serve built static React app
    else {
      serveStatic(app);
    }

    server.listen(PORT, "0.0.0.0", () => {
      log(`🚀 Server running at http://localhost:${PORT}`);
      log(`📡 Env: ${NODE_ENV}`);
      log(`🔗 API: http://localhost:${PORT}/api`);
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        log(`❌ Port ${PORT} is already in use.`);
      } else {
        log(`❌ Server error: ${err.message}`);
      }
      process.exit(1);
    });
  } catch (err: any) {
    log(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
})();

