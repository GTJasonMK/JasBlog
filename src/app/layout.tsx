import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC } from "next/font/google";
import { Agentation } from "agentation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// 只加载必要的字重，减少字体文件大小
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700"], // 只加载常规和粗体
  display: "swap", // 先显示系统字体，字体加载后再替换
  preload: false, // 不预加载，让页面先渲染
  variable: "--font-chinese",
});

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
  return (
    <html lang="zh-CN" className={notoSerifSC.variable}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
