"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    // 验证用户名
    if (!formData.username.trim()) {
      errors.username = '用户名不能为空';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少需要3个字符';
      isValid = false;
    }
    
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
    } else if (formData.password.length < 6) {
      errors.password = '密码长度至少为6个字符';
      isValid = false;
    }
    
    // 验证确认密码
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const validatePasswords = () => {
    // 检查密码是否一致
    if (formData.password !== formData.confirmPassword) {
      console.log('密码不一致检测:');
      console.log('密码:', formData.password);
      console.log('确认密码:', formData.confirmPassword);
      console.log('是否一致:', formData.password === formData.confirmPassword);
      console.log('密码长度:', formData.password.length);
      console.log('确认密码长度:', formData.confirmPassword.length);
      
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: '两次输入的密码不一致'
      }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');
    
    console.log('提交的表单数据:', formData);
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    // 额外的密码一致性检查
    if (!validatePasswords()) {
      setError('两次输入的密码不一致');
      return;
    }
    
    try {
      setLoading(true);
      // 发送到后端的数据
      console.log('发送到后端的数据:', formData);
      
      const result = await register(formData);
      console.log('注册结果:', result);
      
      if (result.success) {
        setSuccessMsg('注册成功！正在跳转到登录页面...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('注册错误:', err);
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
          <h1 className="text-3xl font-bold mb-8 text-center">创建账号</h1>
          
          {error && (
            <div className="bg-red-900/20 text-red-500 p-4 rounded-lg mb-6 border border-red-800">
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-green-900/20 text-green-500 p-4 rounded-lg mb-6 border border-green-800">
              {successMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] p-6 rounded-lg border border-white/5 shadow-lg">
            <div className="mb-4">
              <label htmlFor="username" className="block mb-2 text-sm font-medium">
                用户名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => validateForm()}
                className={`w-full p-3 bg-[var(--background)] border ${formErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                placeholder="请输入用户名"
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
            
            <div className="mb-4">
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
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                确认密码
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => validateForm()}
                className={`w-full p-3 bg-[var(--background)] border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:border-[var(--accent-color)]`}
                placeholder="请再次输入密码"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                账号类型
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  普通用户
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  管理员
                </label>
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
              {loading ? '注册中...' : '注册'}
            </button>
            
            <div className="mt-4 text-center text-[var(--text-secondary)]">
              已有账号？
              <Link href="/auth/login" className="text-[var(--accent-color)] hover:underline ml-1">
                登录
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 