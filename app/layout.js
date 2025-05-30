import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/components.css";
// import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { AuthProvider } from '../context/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "影评空间 - 发现优质电影",
  description: "发现最好的电影和最真实的评论，让每一次观影都成为一次难忘的体验",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #0c1222 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        <AuthProvider>
        {process.env.NODE_ENV === 'development' }
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
