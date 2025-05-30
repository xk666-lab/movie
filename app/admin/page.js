"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalReviews: 0,
    recentMovies: [],
    recentUsers: [],
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取仪表板数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 获取统计数据
        const statsResponse = await axios.get('http://localhost:5000/api/admin/stats');
        
        // 获取最近添加的电影
        const recentMoviesResponse = await axios.get('http://localhost:5000/api/movies?limit=5&sort=createdAt:desc');
        
        // 获取最近注册的用户
        const recentUsersResponse = await axios.get('http://localhost:5000/api/admin/users?limit=5&sort=createdAt:desc');
        
        // 获取最近的评论
        const recentReviewsResponse = await axios.get('http://localhost:5000/api/reviews?limit=5&sort=createdAt:desc');
        
        if (statsResponse.data.success) {
          setStats({
            totalMovies: statsResponse.data.stats.totalMovies || 0,
            totalUsers: statsResponse.data.stats.totalUsers || 0,
            totalReviews: statsResponse.data.stats.totalReviews || 0,
            recentMovies: recentMoviesResponse.data.movies || [],
            recentUsers: recentUsersResponse.data.users || [],
            recentReviews: recentReviewsResponse.data.reviews || []
          });
        } else {
          setError('获取统计数据失败');
        }
      } catch (err) {
        console.error('获取仪表板数据错误:', err);
        setError('服务器错误，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">管理员仪表板</h1>
            
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-12 w-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-[var(--text-secondary)]">加载数据中...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 text-red-500 p-6 rounded-lg border border-red-800 text-center">
                {error}
              </div>
            ) : (
              <>
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">电影总数</h2>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{stats.totalMovies}</p>
                    <Link href="/admin/movies" className="text-sm text-[var(--accent-color)] hover:underline mt-2 inline-block">
                      管理电影 →
                    </Link>
                  </div>
                  
                  <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">用户总数</h2>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{stats.totalUsers}</p>
                    <Link href="/admin/users" className="text-sm text-[var(--accent-color)] hover:underline mt-2 inline-block">
                      管理用户 →
                    </Link>
                  </div>
                  
                  <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">评论总数</h2>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{stats.totalReviews}</p>
                    <Link href="/admin/reviews" className="text-sm text-[var(--accent-color)] hover:underline mt-2 inline-block">
                      管理评论 →
                    </Link>
                  </div>
                </div>
                
                {/* 快速操作 */}
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg mb-10">
                  <h2 className="text-xl font-semibold mb-4">快速操作</h2>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/admin/movies/add" className="px-4 py-2 bg-[var(--accent-color)] text-black rounded-lg hover:bg-[var(--accent-color)]/90">
                      添加电影
                    </Link>
                    <Link href="/admin/users/add" className="px-4 py-2 bg-[var(--accent-color)] text-black rounded-lg hover:bg-[var(--accent-color)]/90">
                      添加用户
                    </Link>
                    <Link href="/admin/categories" className="px-4 py-2 bg-[var(--accent-color)] text-black rounded-lg hover:bg-[var(--accent-color)]/90">
                      管理分类
                    </Link>
                  </div>
                </div>
                
                {/* 最近数据 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 最近添加的电影 */}
                  <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">最近添加的电影</h2>
                    {stats.recentMovies.length > 0 ? (
                      <ul className="space-y-3">
                        {stats.recentMovies.map(movie => (
                          <li key={movie.id} className="border-b border-gray-700 pb-2 last:border-0">
                            <Link href={`/movies/${movie.id}`} className="hover:text-[var(--accent-color)]">
                              {movie.title}
                            </Link>
                            <p className="text-sm text-[var(--text-secondary)]">{formatDate(movie.createdAt)}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[var(--text-secondary)]">暂无电影数据</p>
                    )}
                  </div>
                  
                  {/* 最近注册的用户 */}
                  <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">最近注册的用户</h2>
                    {stats.recentUsers.length > 0 ? (
                      <ul className="space-y-3">
                        {stats.recentUsers.map(user => (
                          <li key={user.id} className="border-b border-gray-700 pb-2 last:border-0">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-black text-xs font-bold mr-2">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p>{user.username}</p>
                                <p className="text-sm text-[var(--text-secondary)]">{formatDate(user.createdAt)}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[var(--text-secondary)]">暂无用户数据</p>
                    )}
                  </div>
                  
                  {/* 最近的评论 */}
                  <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">最近的评论</h2>
                    {stats.recentReviews.length > 0 ? (
                      <ul className="space-y-3">
                        {stats.recentReviews.map(review => (
                          <li key={review.id} className="border-b border-gray-700 pb-2 last:border-0">
                            <p className="line-clamp-1">{review.content}</p>
                            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                              <span>{review.user?.username || '未知用户'}</span>
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[var(--text-secondary)]">暂无评论数据</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 