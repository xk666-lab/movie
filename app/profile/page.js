"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import Image from 'next/image';
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  // 表单错误状态
  const [formErrors, setFormErrors] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 当用户数据加载时更新表单
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        username: user.username,
        email: user.email
      }));
      
      // 设置头像预览
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url.startsWith('http') 
          ? user.avatar_url 
          : `http://localhost:5000${user.avatar_url}`);
      }
      
      // 加载用户评论
      fetchUserReviews();
      
      // 调试用户信息
      console.log('用户信息:', user);
      if (user.created_at) {
        console.log('注册时间:', user.created_at, new Date(user.created_at).toLocaleDateString('zh-CN'));
      }
    }
  }, [user]);

  // 获取认证令牌函数
  const getAuthToken = () => {
    return Cookies.get('token');
  };

  // 获取用户评论
  const fetchUserReviews = async () => {
    if (!user) return;
    
    try {
      setLoadingReviews(true);
      // 获取认证令牌
      const token = getAuthToken();
      
      const response = await axios.get(`http://localhost:5000/api/reviews/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('获取用户评论失败:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // 验证表单
  const validateForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // 验证用户名
    if (!profileData.username.trim()) {
      errors.username = '用户名不能为空';
      isValid = false;
    } else if (profileData.username.length < 3) {
      errors.username = '用户名至少需要3个字符';
      isValid = false;
    }
    
    // 如果要修改密码，验证密码字段
    if (profileData.newPassword || profileData.currentPassword || profileData.confirmPassword) {
      if (!profileData.currentPassword) {
        errors.currentPassword = '请输入当前密码';
        isValid = false;
      }
      
      if (!profileData.newPassword) {
        errors.newPassword = '请输入新密码';
        isValid = false;
      } else if (profileData.newPassword.length < 6) {
        errors.newPassword = '新密码长度至少为6个字符';
        isValid = false;
      }
      
      if (!profileData.confirmPassword) {
        errors.confirmPassword = '请确认新密码';
        isValid = false;
      } else if (profileData.newPassword !== profileData.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // 首先更新用户名
      const updateData = {
        username: profileData.username
      };
      
      console.log('发送更新请求:', updateData);
      
      // 检查用户名是否与当前用户名相同
      if (updateData.username === user?.username) {
        console.log('用户名未变更，跳过更新请求');
        setMessage({ text: '用户名未变更，无需更新', type: 'info' });
      } else {
        try {
          // 获取认证令牌
          const token = getAuthToken();
          if (!token) {
            throw new Error('未找到认证令牌，请重新登录');
          }
          
          console.log('发送请求前的认证令牌:', token);
          console.log('完整请求配置:', {
            url: 'http://localhost:5000/api/auth/profile',
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            data: updateData
          });
          
          const response = await axios.put('http://localhost:5000/api/auth/profile', updateData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('更新响应:', response.data);
          
          if (response.data.success) {
            setMessage({ text: '个人资料更新成功', type: 'success' });
            
            // 更新全局用户状态
            updateUser({ username: profileData.username });
            
            // 清除密码字段
            setProfileData(prev => ({
              ...prev,
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }));
          } else {
            setMessage({ text: response.data.message || '更新失败', type: 'error' });
          }
        } catch (apiError) {
          console.error('API错误详情:', apiError);
          console.error('错误响应:', apiError.response);
          console.error('错误请求:', apiError.request);
          console.error('错误消息:', apiError.message);
          console.error('错误配置:', apiError.config);
          
          let errorMessage = '更新失败';
          if (apiError.response && apiError.response.data) {
            console.error('错误响应数据:', apiError.response.data);
            errorMessage = apiError.response.data.message || errorMessage;
            
            // 如果有验证错误，显示详细信息
            if (apiError.response.data.errors && Array.isArray(apiError.response.data.errors)) {
              errorMessage = apiError.response.data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            }
          }
          
          setMessage({ 
            text: `更新失败: ${errorMessage}`, 
            type: 'error' 
          });
        }
      }
      
      // 如果提供了密码，使用单独的API更新密码
      if (profileData.currentPassword && profileData.newPassword) {
        const passwordData = {
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
          confirmPassword: profileData.confirmPassword
        };
        
        try {
          // 获取认证令牌
          const token = getAuthToken();
          
          await axios.put('http://localhost:5000/api/auth/change-password', passwordData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (passwordError) {
          console.error('密码更新错误:', passwordError.response?.data || passwordError.message);
          setMessage({ 
            text: `密码更新失败: ${passwordError.response?.data?.message || passwordError.message}`, 
            type: 'error' 
          });
        }
      }
    } catch (error) {
      console.error('更新个人资料错误:', error);
      setMessage({ 
        text: error.response?.data?.message || '更新失败，请稍后再试', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 触发文件选择对话框
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  // 处理头像文件选择
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      // 创建本地预览URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };
  
  // 上传头像
  const handleAvatarUpload = async () => {
    if (!avatar) return;
    
    try {
      setUploadingAvatar(true);
      setMessage({ text: '', type: '' });
      
      const formData = new FormData();
      formData.append('avatar', avatar);
      
      // 获取认证令牌
      const token = getAuthToken();
      
      const response = await axios.post('http://localhost:5000/api/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setMessage({ text: '头像上传成功', type: 'success' });
        // 更新预览URL为服务器返回的URL
        const serverUrl = response.data.data.avatar_url;
        const fullUrl = `http://localhost:5000${serverUrl}`;
        setAvatarPreview(fullUrl);
        
        // 更新全局用户状态中的头像URL
        updateUser({ avatar_url: serverUrl });
        
        // 重置文件输入
        setAvatar(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage({ text: response.data.message || '上传失败', type: 'error' });
      }
    } catch (error) {
      console.error('上传头像错误:', error);
      setMessage({ 
        text: error.response?.data?.message || '上传失败，请稍后再试', 
        type: 'error' 
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">个人资料</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 用户信息卡片 */}
              <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                <div className="flex flex-col items-center">
                  {/* 头像上传区域 */}
                  <div 
                    className="relative w-24 h-24 rounded-full overflow-hidden mb-4 cursor-pointer group"
                    onClick={handleAvatarClick}
                  >
                    {avatarPreview ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={avatarPreview} 
                          alt="用户头像" 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs">更换头像</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-[var(--accent-color)] flex items-center justify-center text-black text-4xl font-bold">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs">上传头像</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                  
                  {avatar && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="mb-4 px-3 py-1 bg-[var(--accent-color)] text-black text-sm rounded-lg hover:bg-[var(--accent-color)]/90 disabled:opacity-50"
                    >
                      {uploadingAvatar ? '上传中...' : '保存头像'}
                    </button>
                  )}
                  
                  <h2 className="text-xl font-semibold">{user?.username}</h2>
                  <p className="text-[var(--text-secondary)] mb-2">{user?.email}</p>
                  <span className="px-3 py-1 bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-full text-sm">
                    {user?.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                  
                  <div className="mt-4 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">注册时间</span>
                      <span className="text-sm">
                        {user?.created_at ? 
                          new Date(user.created_at).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          '未知'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">评论数量</span>
                      <span className="text-sm">{reviews.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 编辑表单 */}
              <div className="md:col-span-2 bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">编辑个人资料</h2>
                
                {message.text && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    message.type === 'success' 
                      ? 'bg-green-900/20 text-green-500 border border-green-800' 
                      : 'bg-red-900/20 text-red-500 border border-red-800'
                  }`}>
                    {message.text}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="username" className="block mb-2 text-sm font-medium">
                      用户名
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      className={`w-full p-3 bg-[var(--background)] border ${formErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium">
                      电子邮箱
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full p-3 bg-[var(--background)] border border-gray-700 rounded-lg opacity-70 cursor-not-allowed"
                    />
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">电子邮箱不可更改</p>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-3 mt-6">更改密码</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium">
                      当前密码
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={profileData.currentPassword}
                      onChange={handleChange}
                      className={`w-full p-3 bg-[var(--background)] border ${formErrors.currentPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                    />
                    {formErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium">
                      新密码
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={profileData.newPassword}
                      onChange={handleChange}
                      className={`w-full p-3 bg-[var(--background)] border ${formErrors.newPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                    />
                    {formErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                      确认新密码
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={profileData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full p-3 bg-[var(--background)] border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-[var(--accent-color)] text-black hover:bg-[var(--accent-color)]/90'
                    }`}
                  >
                    {loading ? '保存中...' : '保存更改'}
                  </button>
                </form>
              </div>
            </div>
            
            {/* 用户评论 */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">我的评论</h2>
              
              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-[var(--accent-color)] border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-[var(--text-secondary)]">加载评论中...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="bg-[var(--card-bg)] rounded-lg border border-white/5 p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{review.hx_title || '未知电影'}</h3>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg 
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm mb-2 line-clamp-2">{review.content}</p>
                      <div className="text-xs text-[var(--text-secondary)]">{new Date(review.created_at).toLocaleDateString('zh-CN')}</div>
                    </div>
                  ))}
                  
                  {reviews.length > 3 && (
                    <div className="text-center mt-2">
                      <a href="/my-reviews" className="text-[var(--accent-color)] hover:underline">
                        查看全部 {reviews.length} 条评论
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 text-center">
                  <p className="text-[var(--text-secondary)]">您还没有发表任何评论</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 