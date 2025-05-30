"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import axios from 'axios';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // 获取用户评论
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/reviews/user`);
        if (response.data.success) {
          setReviews(response.data.data || []);
          console.log('获取到的评论:', response.data.data);
        } else {
          setError('获取评论失败');
        }
      } catch (err) {
        console.error('获取评论错误:', err);
        setError('服务器错误，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  // 删除评论
  const handleDeleteReview = async (reviewId) => {
    try {
      setDeleteLoading(reviewId);
      setMessage({ text: '', type: '' });
      
      const response = await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`);
      
      if (response.data.success) {
        // 从列表中移除已删除的评论
        setReviews(reviews.filter(review => review.id !== reviewId));
        setMessage({ text: '评论已成功删除', type: 'success' });
      } else {
        setMessage({ text: response.data.message || '删除评论失败', type: 'error' });
      }
    } catch (err) {
      console.error('删除评论错误:', err);
      setMessage({ 
        text: err.response?.data?.message || '删除评论失败，请稍后再试', 
        type: 'error' 
      });
    } finally {
      setDeleteLoading(null);
    }
  };
  
  // 开始编辑评论
  const startEditReview = (review) => {
    setEditingReview(review);
    setEditContent(review.content);
    setEditRating(review.rating || 5);
  };
  
  // 取消编辑
  const cancelEditReview = () => {
    setEditingReview(null);
    setEditContent('');
    setEditRating(5);
  };
  
  // 提交编辑
  const submitEditReview = async () => {
    if (!editingReview) return;
    
    try {
      setEditSubmitting(true);
      setMessage({ text: '', type: '' });
      
      const response = await axios.put(`http://localhost:5000/api/reviews/${editingReview.id}`, {
        content: editContent,
        rating: editRating
      });
      
      if (response.data.success) {
        // 更新评论列表
        setReviews(reviews.map(review => 
          review.id === editingReview.id ? response.data.data : review
        ));
        setMessage({ text: '评论已成功更新', type: 'success' });
        cancelEditReview();
      } else {
        setMessage({ text: response.data.message || '更新评论失败', type: 'error' });
      }
    } catch (err) {
      console.error('更新评论错误:', err);
      setMessage({ 
        text: err.response?.data?.message || '更新评论失败，请稍后再试', 
        type: 'error' 
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">我的评论</h1>
              <Link href="/movies" className="px-4 py-2 bg-[var(--accent-color)] text-black rounded-lg hover:bg-[var(--accent-color)]/90">
                浏览电影
              </Link>
            </div>
            
            {message.text && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-900/20 text-green-500 border border-green-800' 
                  : 'bg-red-900/20 text-red-500 border border-red-800'
              }`}>
                {message.text}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-12 w-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-[var(--text-secondary)]">加载评论中...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 text-red-500 p-6 rounded-lg border border-red-800 text-center">
                {error}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="bg-[var(--card-bg)] rounded-lg border border-white/5 overflow-hidden">
                    {editingReview && editingReview.id === review.id ? (
                      // 编辑表单
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4">编辑评论</h3>
                        <div className="mb-4">
                          <label className="block mb-2 text-sm font-medium">电影</label>
                          <div className="text-[var(--text-secondary)]">{review.hx_title}</div>
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2 text-sm font-medium">评分</label>
                          <div className="flex mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button 
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="text-2xl"
                              >
                                <span className={star <= editRating ? 'text-[var(--accent-color)]' : 'text-gray-500'}>★</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="editContent" className="block mb-2 text-sm font-medium">评论内容</label>
                          <textarea
                            id="editContent"
                            rows="4"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 bg-[var(--background)] border border-gray-700 rounded-lg focus:outline-none focus:border-[var(--accent-color)]"
                          ></textarea>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEditReview}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                          >
                            取消
                          </button>
                          <button
                            onClick={submitEditReview}
                            disabled={editSubmitting}
                            className="px-4 py-2 bg-[var(--accent-color)] text-black rounded-lg hover:bg-[var(--accent-color)]/90 disabled:opacity-50"
                          >
                            {editSubmitting ? '更新中...' : '更新评论'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 评论展示
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Link href={`/movies/${review.movie_id}`} className="text-xl font-semibold hover:text-[var(--accent-color)]">
                            {review.hx_title || '未知电影'}
                          </Link>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <svg 
                                key={star}
                                className={`w-5 h-5 ${star <= review.rating ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-[var(--text-secondary)] mb-4">{review.content}</p>
                        
                        <div className="flex justify-between items-center text-sm text-[var(--text-secondary)]">
                          <span>{new Date(review.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => startEditReview(review)}
                              className="text-[var(--accent-color)] hover:underline flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              编辑
                            </button>
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deleteLoading === review.id}
                              className="text-red-400 hover:text-red-500 disabled:opacity-50 flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {deleteLoading === review.id ? '删除中...' : '删除'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[var(--card-bg)] p-10 rounded-lg border border-white/5 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-xl font-semibold mb-2">您还没有发表任何评论</h2>
                <p className="text-[var(--text-secondary)] mb-6">浏览电影并分享您的观点</p>
                <Link href="/movies" className="px-6 py-2 bg-[var(--accent-color)] text-black rounded-lg hover:bg-[var(--accent-color)]/90">
                  探索电影
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 