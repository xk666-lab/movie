"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 监听滚动事件，添加导航栏滚动效果
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 处理用户菜单的显示隐藏
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // 处理用户登出
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className={`navbar py-4 px-4 ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="navbar-logo">
          <span className="text-xl font-bold gradient-text">影评空间</span>
        </Link>
        
        <div className="navbar-links hidden md:flex">
          <Link href="/" className={`navbar-link ${pathname === '/' ? 'text-[var(--accent-color)]' : ''}`}>
            首页
          </Link>
          <Link href="/movies" className={`navbar-link ${pathname === '/movies' || pathname.startsWith('/movies/') ? 'text-[var(--accent-color)]' : ''}`}>
            电影
          </Link>
          <Link href="/reviews" className={`navbar-link ${pathname === '/reviews' ? 'text-[var(--accent-color)]' : ''}`}>
            评论
          </Link>
          {isAuthenticated() && user?.role === 'admin' && (
            <Link href="/admin" className={`navbar-link ${pathname === '/admin' ? 'text-[var(--accent-color)]' : ''}`}>
              管理
          </Link>
          )}
        </div>
        
        <div className="navbar-actions">
          <Link href="/movies" className="search-button mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            搜索
          </Link>
          
          {isAuthenticated() ? (
            <div className="relative">
              <button 
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.avatar_url ? (
                    <img 
                      src={`http://localhost:5000${user.avatar_url}`} 
                      alt={`${user.username}的头像`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=00CCCC&color=000000`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--accent-color)] flex items-center justify-center text-black font-bold">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <span className="hidden md:inline">{user?.username}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] rounded-lg shadow-lg py-2 z-50 border border-white/5">
                  <Link href="/profile" className="block px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--accent-color)]">
                    个人资料
                  </Link>
                  <Link href="/my-reviews" className="block px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--accent-color)]">
                    我的评论
                  </Link>
                  <hr className="my-2 border-gray-700" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-[var(--background)] hover:text-red-500"
                  >
                    退出登录
          </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="login-button glow-effect">
            <span className="relative z-10">登录</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 