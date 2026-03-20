import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Article Site Starter",
  description: "Next.js 16 + TypeScript + UnoCSS + lucide-react starter for an article community website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
