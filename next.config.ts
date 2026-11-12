import type { NextConfig } from "next";
import { siteBasePath } from "./src/lib/site-config";

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: process.cwd(),
  },
  // 自定义域名时不需要 basePath
  // 非自定义域名且部署到子路径时需要设置 basePath
  basePath: siteBasePath,
  assetPrefix: siteBasePath ? `${siteBasePath}/` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
