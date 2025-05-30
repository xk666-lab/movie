"use client"
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // 初始化 - 检查cookie中的用户信息
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 从cookie获取用户信息和令牌
        const token = Cookies.get('token');
        const storedUser = Cookies.get('user');
        
        if (storedUser && token) {
          // 设置默认请求头
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const userData = JSON.parse(storedUser);
          
          // 检查用户信息是否包含created_at字段
          if (!userData.created_at) {
            console.log('用户信息不完整，尝试获取完整信息');
            try {
              // 尝试获取完整的用户信息
              const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.data.success) {
                const completeUserInfo = response.data.data;
                console.log('获取完整用户信息成功:', completeUserInfo);
                
                // 更新cookie中的用户信息
                Cookies.set('user', JSON.stringify(completeUserInfo), { 
                  expires: 7, 
                  secure: process.env.NODE_ENV === 'production' 
                });
                
                // 设置用户状态
                setUser(completeUserInfo);
              } else {
                // 如果获取失败，仍使用原始信息
                setUser(userData);
              }
            } catch (error) {
              console.error('获取完整用户信息失败:', error);
              // 使用原始信息
              setUser(userData);
            }
          } else {
            // 用户信息已完整
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
        // 清除可能损坏的数据
        Cookies.remove('token');
        Cookies.remove('user');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    // 只在客户端执行
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, []);

  // 登录函数
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('开始登录，发送数据:', { login: email, password });
      
      // 注意：后端API期望的是login字段，而不是email字段
      const response = await axios.post('http://localhost:5000/api/auth/login', { login: email, password });
      console.log('登录响应:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        console.log('登录成功，用户信息:', user);
        
        // 登录成功后，获取完整的用户信息
        try {
          const userResponse = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userResponse.data.success) {
            // 使用更完整的用户信息，包含created_at字段
            const completeUserInfo = userResponse.data.data;
            console.log('获取完整用户信息成功:', completeUserInfo);
            
            // 保存到cookie，设置过期时间为7天
            Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
            Cookies.set('user', JSON.stringify(completeUserInfo), { expires: 7, secure: process.env.NODE_ENV === 'production' });
            
            // 设置默认请求头
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // 更新状态
            setUser(completeUserInfo);
          } else {
            // 如果获取完整信息失败，仍使用原始的用户信息
            Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
            Cookies.set('user', JSON.stringify(user), { expires: 7, secure: process.env.NODE_ENV === 'production' });
            
            // 设置默认请求头
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // 更新状态
            setUser(user);
          }
        } catch (profileError) {
          console.error('获取完整用户信息失败:', profileError);
          
          // 如果获取完整信息失败，仍使用原始的用户信息
          Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
          Cookies.set('user', JSON.stringify(user), { expires: 7, secure: process.env.NODE_ENV === 'production' });
          
          // 设置默认请求头
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // 更新状态
          setUser(user);
        }
        
        return { success: true };
      } else {
        console.error('登录失败:', response.data.message);
        return { success: false, message: response.data.message || '登录失败' };
      }
    } catch (error) {
      console.error('登录错误:', error);
      
      let errorMessage = '登录失败，请检查您的凭据';
      
      if (error.response) {
        console.log('错误响应状态:', error.response.status);
        console.log('错误响应数据:', error.response.data);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.log('请求发送但没有收到响应');
        errorMessage = '服务器无响应，请检查网络连接';
      } else {
        console.log('请求设置错误:', error.message);
        errorMessage = '请求错误，请稍后再试';
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 注册函数
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('开始注册，发送数据:', userData);
      
      // 确保userData包含confirmPassword字段
      if (!userData.confirmPassword) {
        return { 
          success: false, 
          message: '确认密码是必填项' 
        };
      }
      
      // 检查两次密码是否一致
      if (userData.password !== userData.confirmPassword) {
        console.log('密码不一致:', userData.password, userData.confirmPassword);
        return { 
          success: false, 
          message: '两次输入的密码不一致' 
        };
      }
      
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      console.log('注册响应:', response.data);
      
      if (response.data.success) {
        return { success: true };
      } else {
        console.error('注册失败:', response.data.message);
        return { success: false, message: response.data.message || '注册失败' };
      }
    } catch (error) {
      console.error('注册错误:', error);
      
      let errorMessage = '注册失败，请稍后再试';
      
      if (error.response) {
        console.log('错误响应状态:', error.response.status);
        console.log('错误响应数据:', error.response.data);
        
        if (error.response.data && error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map(e => e.message).join(', ');
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.log('请求发送但没有收到响应');
        errorMessage = '服务器无响应，请检查网络连接';
      } else {
        console.log('请求设置错误:', error.message);
        errorMessage = '请求错误，请稍后再试';
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    // 清除cookie
    Cookies.remove('token');
    Cookies.remove('user');
    
    // 清除请求头
    delete axios.defaults.headers.common['Authorization'];
    
    // 更新状态
    setUser(null);
    
    // 重定向到登录页
    router.push('/auth/login');
  };

  // 检查用户是否已认证
  const isAuthenticated = () => {
    return !!user;
  };

  // 检查用户是否是管理员
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // 更新用户信息
  const updateUser = (updatedUserData) => {
    if (!user) return;
    
    // 更新用户状态
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    
    // 更新cookie中的用户信息
    Cookies.set('user', JSON.stringify(newUserData), { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production' 
    });
    
    return newUserData;
  };

  // 提供的上下文值
  const contextValue = {
    user,
    loading,
    initialized,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义钩子，用于访问认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}

export default AuthContext; 