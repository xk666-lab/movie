"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
      email: '',
      password: ''
    };
    
    // 验证邮箱
    if (!formData.email.trim()) {
      errors.email = '邮箱不能为空';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
      isValid = false;
    }
    
    // 验证密码
    if (!formData.password) {
      errors.password = '密码不能为空';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    console.log('登录表单数据:', formData);
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await login(formData.email, formData.password);
      
      console.log('登录结果:', result);
      
      if (result.success) {
        // 登录成功，重定向到首页
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('服务器错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">登录</h1>
          
          {error && (
            <div className="bg-red-900/20 text-red-500 p-4 rounded-lg mb-6 border border-red-800">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                电子邮箱
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => validateForm()}
                className={`w-full p-3 bg-[var(--background)] border ${formErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                placeholder="请输入电子邮箱"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                密码
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => validateForm()}
                className={`w-full p-3 bg-[var(--background)] border ${formErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                placeholder="请输入密码"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
              <div className="mt-1 text-right">
                <Link href="/auth/forgot-password" className="text-sm text-[var(--accent-color)] hover:underline">
                  忘记密码？
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[var(--accent-color)] text-black hover:bg-[var(--accent-color)]/90'
              }`}
            >
              {loading ? '登录中...' : '登录'}
            </button>
            
            <div className="mt-4 text-center text-[var(--text-secondary)]">
              还没有账号？
              <Link href="/auth/register" className="text-[var(--accent-color)] hover:underline ml-1">
                注册
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 