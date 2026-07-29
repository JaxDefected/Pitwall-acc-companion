import { appPromise } from "../server";

export default async (req: any, res: any) => {
  const app = await appPromise;
  
  // Reconstruct req.url if rewritten by Vercel
  const originalUrl = req.headers["x-now-route-matches"] || req.url;
  if (originalUrl) {
    req.url = req.url.includes("?") 
      ? originalUrl.split("?")[0] + "?" + req.url.split("?")[1]
      : originalUrl;
  }
  
  return app(req, res);
};
