import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/components.css";
import { StagewiseToolbar } from '@stagewise/toolbar-next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "电影评论网 - 发现最好的电影和最真实的评论",
  description: "浏览电影、阅读评论、分享您的观点",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}
      >
        {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar config={{ plugins: [] }} />
        )}
        {children}
      </body>
    </html>
  );
}
