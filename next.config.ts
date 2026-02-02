import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = process.env.REPO_NAME || "";

const nextConfig: NextConfig = {
  output: "export",
  // 如果部署到 GitHub Pages 子路径（如 username.github.io/repo-name），需要设置 basePath
  // 如果是根域名部署（如 username.github.io 或自定义域名），保持为空
  basePath: isProd && repoName ? `/${repoName}` : "",
  assetPrefix: isProd && repoName ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
