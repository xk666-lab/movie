"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';

export default function MovieDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const movieId = params.id;
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [userRating, setUserRating] = useState(0);
  
  // 评论表单状态
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        
        // 获取电影详情
        try {
          const movieResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}`);
          if (movieResponse.data.success) {
            setMovie(movieResponse.data.data);
            
            // 获取电影评论
            try {
              console.log('正在获取电影评论:', movieId);
              const reviewsResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}/reviews`);
              console.log('评论响应:', reviewsResponse.data);
              
              if (reviewsResponse.data.success) {
                setReviews(reviewsResponse.data.data || []);
                
                // 获取用户对该电影的评分
                if (user) {
                  try {
                    const ratingResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}/rating/user`);
                    if (ratingResponse.data.success && ratingResponse.data.data) {
                      setUserRating(ratingResponse.data.data.rating);
                    }
                  } catch (ratingError) {
                    console.error('获取用户评分失败:', ratingError);
                  }
                }
              } else {
                console.error('获取评论失败:', reviewsResponse.data.message);
              }
            } catch (reviewError) {
              console.error('获取评论失败:', reviewError);
              if (reviewError.response) {
                console.error('错误状态:', reviewError.response.status);
                console.error('错误数据:', reviewError.response.data);
              }
            }
            
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API连接失败:', apiError);
          setError('无法加载电影数据，请稍后再试');
          setLoading(false);
        }
        
      } catch (err) {
        setError('获取电影数据失败');
        setLoading(false);
        console.error(err);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId, user]);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // 提交评论
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    if (!reviewContent.trim()) {
      setMessage({ text: '评论内容不能为空', type: 'error' });
      return;
    }
    
    try {
      setSubmitting(true);
      setMessage({ text: '', type: '' });
      
      const reviewData = {
        content: reviewContent,
        rating: reviewRating
      };
      
      console.log('发送评论数据:', reviewData);
      
      // 始终创建新评论
      const response = await axios.post(`http://localhost:5000/api/movies/${movieId}/reviews`, reviewData);
      
      if (response.data.success) {
        setMessage({ text: '评论已发布', type: 'success' });
        
        // 更新评论列表
        const reviewsResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}/reviews`);
        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.data);
        }
        
        // 清空表单并隐藏
        setReviewContent('');
        setReviewRating(5);
        setShowReviewForm(false);
      } else {
        setMessage({ text: response.data.message || '发布评论失败', type: 'error' });
      }
    } catch (error) {
      console.error('提交评论错误:', error);
      if (error.response) {
        console.error('错误状态:', error.response.status);
        console.error('错误数据:', error.response.data);
      }
      setMessage({ 
        text: error.response?.data?.message || '发布评论失败，请稍后再试', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // 提交评分
  const handleSubmitRating = async (rating) => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const ratingData = { rating };
      console.log('准备发送评分数据:', ratingData, '电影ID:', movieId);
      
      const response = await axios.post(`http://localhost:5000/api/movies/${movieId}/rating`, ratingData);
      console.log('评分响应:', response.data);
      
      if (response.data.success) {
        setUserRating(rating);
        setShowRatingForm(false);
        
        // 更新电影评分
        const movieResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}`);
        if (movieResponse.data.success) {
          setMovie(movieResponse.data.data);
        }
      } else {
        setMessage({ text: response.data.message || '评分失败', type: 'error' });
      }
    } catch (error) {
      console.error('提交评分错误:', error);
      if (error.response) {
        console.error('错误状态:', error.response.status);
        console.error('错误数据:', error.response.data);
      }
      setMessage({ 
        text: error.response?.data?.message || '评分失败，请稍后再试', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // 删除评论
  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    try {
      setSubmitting(true);
      
      const response = await axios.delete(`http://localhost:5000/api/reviews/${userReview.id}`);
      
      if (response.data.success) {
        setMessage({ text: '评论已删除', type: 'success' });
        setUserReview(null);
        setReviewContent('');
        
        // 更新评论列表
        const reviewsResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}/reviews`);
        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.data);
        }
      } else {
        setMessage({ text: response.data.message || '删除评论失败', type: 'error' });
      }
    } catch (error) {
      console.error('删除评论错误:', error);
      setMessage({ 
        text: error.response?.data?.message || '删除评论失败，请稍后再试', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-[var(--text-secondary)]">加载中...</span>
      </div>
    </div>
  );
  
  if (error || !movie) return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="error bg-red-900/20 text-red-500 p-6 rounded-lg border border-red-800 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">出错了</h2>
          <p>{error || '找不到该电影'}</p>
          <div className="mt-6 flex gap-4">
            <button 
              className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              onClick={() => window.location.reload()}
            >
              重试
            </button>
            <Link href="/" className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <div className="movie-hero relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)] z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
          style={{
            backgroundImage: `url(${movie.poster_url || 'https://via.placeholder.com/1200x800?text=No+Image'})`,
            backgroundPosition: 'center 20%'
          }}
        ></div>
      </div>
      
      <div className="container mx-auto px-4 -mt-72 relative z-20">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/20 text-green-500 border border-green-800' 
              : 'bg-red-900/20 text-red-500 border border-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="movie-poster-large rounded-lg overflow-hidden shadow-2xl border border-white/5">
              <img 
                src={movie.poster_url || 'https://via.placeholder.com/500x750?text=No+Image'} 
                alt={`${movie.hx_title} 海报`}
                className="w-full h-auto"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                }}
              />
            </div>
            
            <div className="movie-actions mt-6 flex flex-col gap-3">
              <button 
                className="movie-action-btn flex items-center justify-center"
                onClick={() => isAuthenticated() ? setShowRatingForm(!showRatingForm) : router.push('/auth/login')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {userRating > 0 ? `您的评分: ${userRating}` : '评分'}
              </button>
              
              {showRatingForm && (
                <div className="bg-[var(--card-bg)] p-4 rounded-lg mt-2 border border-white/5">
                  <h4 className="text-sm font-medium mb-3">为这部电影评分</h4>
                  <div className="flex justify-between mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                      <button 
                        key={rating} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          rating <= userRating ? 'bg-[var(--accent-color)] text-black' : 'bg-gray-700'
                        }`}
                        onClick={() => handleSubmitRating(rating)}
                        disabled={submitting}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                className="movie-action-btn flex items-center justify-center"
                onClick={() => isAuthenticated() ? setShowReviewForm(!showReviewForm) : router.push('/auth/login')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                写评论
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{movie.hx_title}</h1>
            
            <div className="flex items-center mb-6">
              <div className="movie-rating flex items-center mr-6">
                <span className="text-[var(--accent-color)] text-2xl font-bold neon-text">{movie.rating}</span>
                <span className="text-[var(--text-secondary)] ml-1">/10</span>
              </div>
              <div className="movie-meta text-[var(--text-secondary)]">
                <span className="mr-4">{movie.hx_genre}</span>
                <span className="mr-4">{movie.duration} 分钟</span>
                <span>{formatDate(movie.release_date)}</span>
              </div>
            </div>
            
            <div className="movie-description mb-8">
              <h3 className="text-xl font-semibold mb-3">剧情简介</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{movie.hx_description || '暂无简介'}</p>
            </div>
            
            {/* 评论表单 */}
            {showReviewForm && (
              <div className="mb-8 bg-[var(--card-bg)] p-6 rounded-lg border border-white/5">
                <h3 className="text-xl font-semibold mb-4">写评论</h3>
                
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">评分</label>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button 
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className="text-2xl"
                        >
                          <span className={rating <= reviewRating ? 'text-[var(--accent-color)]' : 'text-gray-500'}>★</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="content" className="block mb-2 text-sm font-medium">评论内容</label>
                    <textarea
                      id="content"
                      rows="4"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      className="w-full p-3 bg-[var(--background)] border border-gray-700 rounded-lg focus:outline-none focus:border-[var(--accent-color)]"
                      placeholder="分享您对这部电影的看法..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-between">
                    <div></div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-[var(--accent-color)] text-black rounded-lg hover:bg-[var(--accent-color)]/90 disabled:opacity-50"
                      >
                        {submitting ? '提交中...' : '发布评论'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            <div className="movie-reviews">
              <h3 className="text-xl font-semibold mb-4">观众评论</h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => {
                    // 确保评论有评分字段
                    if (review.rating === undefined || review.rating === null) {
                      review.rating = 5;
                    }
                    console.log('处理评论:', review.id, '评分:', review.rating);
                    
                    return (
                      <div key={review.id} className="review-card bg-[var(--card-bg)] p-4 rounded-lg border border-white/5">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            {review.avatar_url ? (
                              <img 
                                src={`http://localhost:5000${review.avatar_url}`} 
                                alt={`${review.username}的头像`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${review.username?.charAt(0) || 'U'}&background=00CCCC&color=000000`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-[var(--accent-color)] flex items-center justify-center text-black font-bold">
                                {review.username?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-bold mr-2">{review.username || '匿名用户'}</h4>
                              {user && review.user_id === user.id && (
                                <span className="text-xs bg-[var(--accent-color)]/20 text-[var(--accent-color)] px-2 py-0.5 rounded-full">
                                  您
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {console.log('渲染评论星星:', review.id, '评分:', review.rating)}
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span 
                                    key={i} 
                                    className={`text-sm ${i < (review.rating || 5) ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)]">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-[var(--text-secondary)]">{review.content}</p>
                        
                        <div className="mt-3 flex justify-between items-center">
                          {/* 点赞按钮 */}
                          <button 
                            onClick={() => {
                              if (!isAuthenticated()) {
                                router.push('/auth/login');
                                return;
                              }
                              
                              axios.post(`http://localhost:5000/api/reviews/${review.id}/like`)
                                .then(response => {
                                  if (response.data.success) {
                                    // 更新点赞状态
                                    setReviews(reviews.map(r => {
                                      if (r.id === review.id) {
                                        return {
                                          ...r,
                                          likes: response.data.data.liked ? r.likes + 1 : r.likes - 1,
                                          liked: response.data.data.liked
                                        };
                                      }
                                      return r;
                                    }));
                                  }
                                })
                                .catch(error => {
                                  console.error('点赞失败:', error);
                                  setMessage({ 
                                    text: error.response?.data?.message || '点赞失败，请稍后再试', 
                                    type: 'error' 
                                  });
                                });
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                              review.liked 
                                ? 'text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10' 
                                : 'text-gray-400 hover:bg-gray-700/30'
                            }`}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5" 
                              fill={review.liked ? "currentColor" : "none"}
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={review.liked ? 0 : 1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>{review.likes || 0}</span>
                          </button>
                          
                          {/* 删除按钮 */}
                          {user && review.user_id === user.id && (
                            <button 
                              onClick={() => {
                                if (confirm('确定要删除这条评论吗？')) {
                                  axios.delete(`http://localhost:5000/api/reviews/${review.id}`)
                                    .then(response => {
                                      if (response.data.success) {
                                        setReviews(reviews.filter(r => r.id !== review.id));
                                        setMessage({ text: '评论已成功删除', type: 'success' });
                                      }
                                    })
                                    .catch(error => {
                                      console.error('删除评论失败:', error);
                                      setMessage({ 
                                        text: error.response?.data?.message || '删除评论失败，请稍后再试', 
                                        type: 'error' 
                                      });
                                    });
                                }
                              }}
                              className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-900/20 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              删除评论
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-secondary)] bg-[var(--card-bg)] p-6 rounded-lg border border-white/5">
                  <p>暂无评论</p>
                  <button 
                    className="mt-4 px-6 py-2 border border-[var(--accent-color)] text-[var(--accent-color)] rounded-full hover:bg-[var(--accent-color)] hover:text-black transition-colors"
                    onClick={() => isAuthenticated() ? setShowReviewForm(true) : router.push('/auth/login')}
                  >
                    成为第一个评论的人
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}