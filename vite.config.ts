import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;

/**
 * Same-origin BFF for Property Enrichment — keeps x-api-key off the client bundle.
 * Used by `vite` and `vite preview`. Amplify static hosting needs a real API/BFF
 * (or Amplify Function) with the same path for production.
 */
function enrichmentProxyPlugin(env: Record<string, string>): Plugin {
  const enrichUrl = (
    env.PROPERTY_ENRICHMENT_URL ||
    "https://9ug42crh6h.execute-api.us-east-1.amazonaws.com/prod"
  ).replace(/\/$/, "");
  const apiKey = env.PROPERTY_ENRICHMENT_API_KEY || "";

  async function handle(
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void,
  ) {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.end();
      return;
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
      return;
    }

    if (!apiKey) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: false,
          error:
            "PROPERTY_ENRICHMENT_API_KEY is not configured. Add it to .env.local for local enrichment.",
        }),
      );
      return;
    }

    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const raw = Buffer.concat(chunks).toString("utf8") || "{}";

      const upstream = await fetch(`${enrichUrl}/v1/property/enrich`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "User-Agent": "allkindsofcleaning-estimator/0.1",
        },
        body: raw,
      });

      const text = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader("Content-Type", "application/json");
      res.end(text);
    } catch (err) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: false,
          error: err instanceof Error ? err.message : "Enrichment proxy failed",
        }),
      );
    }
  }

  return {
    name: "enrichment-bff-proxy",
    configureServer(server) {
      server.middlewares.use("/api/property/enrich", (req, res, next) => {
        void handle(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/property/enrich", (req, res, next) => {
        void handle(req, res, next);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      __BASE_PATH__: JSON.stringify(base),
      __IS_PREVIEW__: JSON.stringify(isPreview),
      __READDY_PROJECT_ID__: JSON.stringify(process.env.PROJECT_ID || ""),
      __READDY_VERSION_ID__: JSON.stringify(process.env.VERSION_ID || ""),
      __READDY_AI_DOMAIN__: JSON.stringify(process.env.READDY_AI_DOMAIN || ""),
    },
    plugins: [
      enrichmentProxyPlugin(env),
      react(),
      AutoImport({
        imports: [
          {
            react: [
              ["default", "React"],
              "useState",
              "useEffect",
              "useContext",
              "useReducer",
              "useCallback",
              "useMemo",
              "useRef",
              "useImperativeHandle",
              "useLayoutEffect",
              "useDebugValue",
              "useDeferredValue",
              "useId",
              "useInsertionEffect",
              "useSyncExternalStore",
              "useTransition",
              "startTransition",
              "lazy",
              "memo",
              "forwardRef",
              "createContext",
              "createElement",
              "cloneElement",
              "isValidElement",
            ],
          },
          {
            "react-router-dom": [
              "useNavigate",
              "useLocation",
              "useParams",
              "useSearchParams",
              "Link",
              "NavLink",
              "Navigate",
              "Outlet",
            ],
          },
          {
            "react-i18next": ["useTranslation", "Trans"],
          },
        ],
        dts: false,
      }),
    ],
    base,
    build: {
      outDir: "out",
      sourcemap: false,
      target: "es2020",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/react-router")) {
              return "vendor-router";
            }
            if (id.includes("node_modules/i18next")) {
              return "vendor-i18n";
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
  };
});
