"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 等待认证状态初始化完成
    if (!initialized) return;

    // 检查是否已登录
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // 如果需要管理员权限但用户不是管理员
    if (adminOnly && !isAdmin()) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, initialized, router, adminOnly]);

  // 如果认证状态尚未初始化，显示加载状态
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--accent-color)]">
          <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // 如果需要管理员权限但用户不是管理员，或者用户未登录，不渲染子组件
  if ((adminOnly && !isAdmin()) || !isAuthenticated()) {
    return null;
  }

  // 渲染子组件
  return children;
} 