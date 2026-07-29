import { appPromise } from "../server.js";

export default async (req: any, res: any) => {
  const app = await appPromise;
  
  // Reconstruct req.url to bypass Vercel rewrites and preserve paths & query parameters
  const forwardedUrl = req.headers["x-forwarded-url"] || req.headers["x-vercel-forwarded-path"];
  if (forwardedUrl && typeof forwardedUrl === "string") {
    try {
      if (forwardedUrl.startsWith("http://") || forwardedUrl.startsWith("https://")) {
        const parsed = new URL(forwardedUrl);
        req.url = parsed.pathname + parsed.search;
      } else {
        req.url = forwardedUrl;
      }
    } catch {
      req.url = forwardedUrl;
    }
  }
  
  return app(req, res);
};
