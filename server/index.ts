import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import type { GameState } from "@shared/schema";

const app = express();

declare module 'express-session' {
  interface SessionData {
    gameState?: GameState;
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

const MemoryStore = createMemoryStore(session);
const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';

// Trust first proxy (Render uses proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Guard reusePort on platforms that support it. Some platforms (Windows)
  // do not support passing reusePort and will throw ENOTSUP when trying to
  // listen. Only set reusePort when not on Windows, and provide a fallback
  // to retry without it if we get an ENOTSUP error.
  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };

  if (process.platform !== 'win32') {
    listenOptions.reusePort = true;
  }

  const onListening = () => {
    log(`serving on port ${port}`);
  };

  server.listen(listenOptions, onListening).on('error', (err: any) => {
    // If reusePort caused ENOTSUP (operation not supported), retry without it.
    if (err && err.code === 'ENOTSUP' && listenOptions.reusePort) {
      log('reusePort not supported on this platform, retrying without it');
      const fallbackOptions = { port, host: "0.0.0.0" };
      server.listen(fallbackOptions, onListening);
    } else {
      // Re-throw other errors so they surface as before
      throw err;
    }
  });
})();
