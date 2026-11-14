import type { Metadata, Viewport } from "next";
import DevelopmentTools from "@/components/DevelopmentTools";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContentHost from "@/components/ContentHost";
import SiteBackground from "@/components/SiteBackground";
import { siteBasePath } from "@/lib/site-config";
import { getSite } from "@/lib/site";
import { getAllPages } from "@/lib/pages";
import { visibleNavigation } from "@jas/content-core";
import { themeBootstrap } from "@/lib/theme";
import "@jas/content-ui/theme.css";
import "@jas/content-ui/styles.css";
import "@jas/graph-ui/styles.css";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f3f2ea" }, { media: "(prefers-color-scheme: dark)", color: "#11251f" }],
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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="base-path" content={siteBasePath} />
        <script id="site-theme" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="site-shell flex flex-col">
        <SiteBackground />
        <a href="#site:main-content" className="skip-link">跳到正文</a>
        <Header name={site.name} navItems={navigation} />
        <main id="site:main-content" tabIndex={-1} data-pagefind-body className="site-main"><ContentHost sections={site.sections} noteCategories={site.noteCategories} commentsEnabled={site.comments.enabled}>{children}</ContentHost></main>
        <Footer text={site.footer} />
        {process.env.NODE_ENV === "development" && <DevelopmentTools />}
      </body>
    </html>
  );
}
