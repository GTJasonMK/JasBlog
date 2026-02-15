import type { Metadata, Viewport } from "next";
import { Agentation } from "agentation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdfbf7",
};

export const metadata: Metadata = {
  title: {
    default: "JasBlog",
    template: "%s | JasBlog",
  },
  description: "一个现代简约中国风的个人博客，分享开源项目和学习经验",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProd = process.env.NODE_ENV === "production";
  const repoName = process.env.REPO_NAME || "";
  const useCustomDomain = process.env.CUSTOM_DOMAIN === "true";
  const basePath = isProd && repoName && !useCustomDomain ? `/${repoName}` : "";

  return (
    <html lang="zh-CN">
      <head>
        <meta name="base-path" content={basePath} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
