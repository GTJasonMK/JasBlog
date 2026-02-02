import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = process.env.REPO_NAME || "";
// 如果使用自定义域名，设置为 true
const useCustomDomain = process.env.CUSTOM_DOMAIN === "true";

const nextConfig: NextConfig = {
  output: "export",
  // 自定义域名时不需要 basePath
  // 非自定义域名且部署到子路径时需要设置 basePath
  basePath: isProd && repoName && !useCustomDomain ? `/${repoName}` : "",
  assetPrefix: isProd && repoName && !useCustomDomain ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
