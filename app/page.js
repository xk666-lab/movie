"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Navbar from '../components/Navbar';
import MovieList from '../components/MovieList';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [latestReviews, setLatestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        setLoading(true);
        // 尝试从后端API获取数据
        try {
          const response = await axios.get(`http://localhost:5000/api/reviews/latest?page=${page}&limit=6`);
          if (response.data.success) {
            setLatestReviews(response.data.data);
            setTotalPages(response.data.pagination.pages);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API连接失败，使用示例数据:', apiError);
          // 如果API请求失败，使用示例数据
          const exampleReviews = [
            {
              id: 1,
              content: '这部电影真的很棒，情节扣人心弦，演员表演精湛。强烈推荐给所有电影爱好者！希望能有更多这样的作品出现。',
              rating: 9.5,
              created_at: '2023-10-15T00:00:00Z',
              user_id: 1,
              username: '影评人小王',
              avatar_url: null,
              movie_id: 1,
              hx_title: '肖申克的救赎',
              poster_url: 'https://via.placeholder.com/300x450?text=肖申克的救赎'
            },
            {
              id: 2,
              content: '经典中的经典，每一次重看都有新的发现。马龙·白兰度的表演无可挑剔。这部电影定义了黑帮片的标准。',
              rating: 9.2,
              created_at: '2023-10-12T00:00:00Z',
              user_id: 2,
              username: '电影达人',
              avatar_url: null,
              movie_id: 2,
              hx_title: '教父',
              poster_url: 'https://via.placeholder.com/300x450?text=教父'
            }
          ];
          setLatestReviews(exampleReviews);
          setTotalPages(1);
          setLoading(false);
        }
      } catch (err) {
        setError('获取最新评论失败');
        setLoading(false);
        console.error(err);
      }
    };

    fetchLatestReviews();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 将评分转换为星星显示
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    
    return stars.join('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="hero-section">
          <div className="hero-background"></div>
          <div className="hero-content">
            <h1 className="hero-title">探索电影的艺术</h1>
            <p className="hero-subtitle">发现最好的电影和最真实的评论，让每一次观影都成为一次难忘的体验</p>
            <form onSubmit={handleSearch} className="hero-search">
              <input 
                type="text" 
                placeholder="搜索电影、导演或演员..." 
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="section-title">热门电影</h2>
          <MovieList />
        </section>
        
        <section className="mb-16">
          <h2 className="section-title">最新评论</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loading-spinner"></div>
              <span className="ml-3">加载中...</span>
            </div>
          ) : error ? (
            <div className="error bg-red-900/20 text-red-500 p-4 rounded-lg border border-red-800">
              <p>{error}</p>
              <button 
                className="mt-2 text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
                onClick={() => window.location.reload()}
              >
                重试
              </button>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestReviews.map(review => (
                  <div key={review.id} className="review-card">
              <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-color)] opacity-90 mr-3 flex items-center justify-center text-white">
                        {review.username.charAt(0).toUpperCase()}
                      </div>
                <div>
                        <h4 className="font-bold">{review.username}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{formatDate(review.created_at)}</p>
                </div>
              </div>
                    <h3 className="text-xl font-bold mb-2">{review.hx_title}</h3>
              <div className="flex mb-3">
                      <span className="text-[var(--accent-color)] neon-text">{renderStars(review.rating)}</span>
                      <span className="ml-2 text-[var(--accent-color)]">{review.rating}/10</span>
                    </div>
                    <p className="text-[var(--text-secondary)]">{review.content}</p>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination flex justify-center mt-8 space-x-2">
                  <button 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={page === 1}
                    className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
                  >
                    上一页
                  </button>
                  
                  <div className="page-numbers flex space-x-2">
                    {[...Array(totalPages).keys()].map(num => (
                      <button
                        key={num + 1}
                        onClick={() => handlePageChange(num + 1)}
                        className={`pagination-number ${page === num + 1 ? 'active' : ''}`}
                      >
                        {num + 1}
                      </button>
                    ))}
            </div>
            
                  <button 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={page === totalPages}
                    className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mb-16">
          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-opacity-10 border-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4 gradient-text">加入我们的社区</h2>
                <p className="text-[var(--text-secondary)] mb-6">分享你的观点，与其他电影爱好者交流，发现更多优质电影。</p>
                <button className="login-button glow-effect" onClick={() => router.push('/auth/register')}>
                  <span className="relative z-10">立即注册</span>
                </button>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-secondary)] opacity-20"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-[var(--card-bg)] py-8 mt-auto border-t border-opacity-10 border-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-[var(--accent-color)]">影评空间</h3>
              <p className="text-[var(--text-secondary)] mt-2">发现电影的无限可能</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">关于我们</a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">隐私政策</a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">联系我们</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-[var(--text-secondary)]">
            <p>© 2023 影评空间 - 所有权利保留</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
