import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC } from "next/font/google";
import DevelopmentTools from "@/components/DevelopmentTools";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContentHost from "@/components/ContentHost";
import { siteBasePath } from "@/lib/site-config";
import { getSite } from "@/lib/site";
import { getAllPages } from "@/lib/pages";
import { visibleNavigation } from "@jas/content-core";
import "./globals.css";
import "@jas/content-ui/styles.css";
import "@jas/graph-ui/styles.css";

const siteFont = Noto_Serif_SC({
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "optional",
  fallback: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", "serif"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdfbf7",
};

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: { icon: `${siteBasePath}/favicon.svg` },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getSite();
  const navigation = visibleNavigation(site, getAllPages().map((page) => page.slug));
  return (
    <html lang="zh-CN">
      <head>
        <meta name="base-path" content={siteBasePath} />
      </head>
      <body className={`${siteFont.className} min-h-screen flex flex-col`}>
        <a href="#site:main-content" className="skip-link">跳到正文</a>
        <Header name={site.name} navItems={navigation} />
        <main id="site:main-content" tabIndex={-1} data-pagefind-body className="flex-1"><ContentHost sections={site.sections} commentsEnabled={site.comments.enabled}>{children}</ContentHost></main>
        <Footer text={site.footer} />
        {process.env.NODE_ENV === "development" && <DevelopmentTools />}
      </body>
    </html>
  );
}
