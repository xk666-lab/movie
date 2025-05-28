import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="navbar-logo">
          <svg width="160" height="40" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 电影胶片图标 */}
            <rect x="5" y="8" width="30" height="24" rx="2" stroke="#00E5FF" strokeWidth="2" />
            <circle cx="10" cy="12" r="1.5" fill="#00E5FF" />
            <circle cx="10" cy="18" r="1.5" fill="#00E5FF" />
            <circle cx="10" cy="24" r="1.5" fill="#00E5FF" />
            <circle cx="10" cy="30" r="1.5" fill="#00E5FF" />
            <circle cx="30" cy="12" r="1.5" fill="#00E5FF" />
            <circle cx="30" cy="18" r="1.5" fill="#00E5FF" />
            <circle cx="30" cy="24" r="1.5" fill="#00E5FF" />
            <circle cx="30" cy="30" r="1.5" fill="#00E5FF" />
            
            {/* 文字：影评空间 */}
            <path d="M45 12H55M50 12V32" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M60 12V32M60 22H68M75 12V32H85" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M95 12H105C110 12 115 16 115 20C115 24 110 28 105 28H95V12Z" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M125 12V32M125 12H140M125 22H135M125 32H140" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
        
        <div className="navbar-links">
          <Link href="/" className="navbar-link">
            首页
          </Link>
          <Link href="/movies" className="navbar-link">
            探索电影
          </Link>
          <Link href="#" className="navbar-link">
            最新评论
          </Link>
          <Link href="#" className="navbar-link">
            关于我们
          </Link>
        </div>
        
        <div className="navbar-actions">
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="relative z-10">搜索</span>
          </button>
          <button className="login-button glow-effect">
            <span className="relative z-10">登录</span>
          </button>
        </div>
      </div>
    </nav>
  );
} 