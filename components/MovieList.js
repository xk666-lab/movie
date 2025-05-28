"use client"
import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // 尝试从后端API获取数据
        try {
          const response = await fetch('http://localhost:5000/api/movies');
          if (response.ok) {
            const data = await response.json();
            setMovies(data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API连接失败，使用示例数据:', apiError);
        }
        
        // 如果API请求失败，使用示例数据
        const exampleMovies = [
          {
            id: 1,
            hx_title: '肖申克的救赎',
            release_date: '1994-09-23',
            rating: 9.3,
            hx_description: '两个被囚禁的男人多年来建立了非凡的友谊，通过共同的体面行为找到了安慰和最终的救赎。',
            poster_url: 'https://via.placeholder.com/300x450?text=肖申克的救赎',
            hx_genre: '剧情'
          },
          {
            id: 2,
            hx_title: '教父',
            release_date: '1972-03-24',
            rating: 9.2,
            hx_description: '一个有组织犯罪家族的老年族长将控制权转移给他不情愿的儿子。',
            poster_url: 'https://via.placeholder.com/300x450?text=教父',
            hx_genre: '犯罪'
          },
          {
            id: 3,
            hx_title: '黑暗骑士',
            release_date: '2008-07-18',
            rating: 9.0,
            hx_description: '当小丑出现并制造混乱时，蝙蝠侠必须面对他所遇到的最大的心理和物理测试之一。',
            poster_url: 'https://via.placeholder.com/300x450?text=黑暗骑士',
            hx_genre: '动作'
          }
        ];
        
        setMovies(exampleMovies);
        setLoading(false);
      } catch (err) {
        setError('获取电影数据失败');
        setLoading(false);
        console.error(err);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="movie-list">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
} 