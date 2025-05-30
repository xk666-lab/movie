"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        // 尝试从后端API获取数据
        try {
          const response = await axios.get(`http://localhost:5000/api/movies?page=${page}&limit=6`);
          if (response.data.success) {
            setMovies(response.data.data);
            setTotalPages(response.data.pagination.pages);
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
          },
          {
            id: 4,
            hx_title: '指环王：王者归来',
            release_date: '2003-12-17',
            rating: 8.9,
            hx_description: '甘道夫和阿拉贡带领人类对抗索伦的军队，而弗罗多和山姆接近魔多山完成销毁魔戒的任务。',
            poster_url: 'https://via.placeholder.com/300x450?text=指环王：王者归来',
            hx_genre: '奇幻'
          },
          {
            id: 5,
            hx_title: '盗梦空间',
            release_date: '2010-07-16',
            rating: 8.8,
            hx_description: '一个窃贼有能力进入人们的梦中并窃取他们潜意识中的秘密，被提供了一个机会，如果他能在一个目标的心中植入一个想法，他的犯罪记录就会被抹去。',
            poster_url: 'https://via.placeholder.com/300x450?text=盗梦空间',
            hx_genre: '科幻'
          },
          {
            id: 6,
            hx_title: '星际穿越',
            release_date: '2014-11-07',
            rating: 8.6,
            hx_description: '一组探险家通过新发现的虫洞进行星际旅行，以克服人类在太空旅行中的限制，征服浩瀚的距离。',
            poster_url: 'https://via.placeholder.com/300x450?text=星际穿越',
            hx_genre: '科幻'
          }
        ];
        
        setMovies(exampleMovies);
        setTotalPages(1);
        setLoading(false);
      } catch (err) {
        setError('获取电影数据失败');
        setLoading(false);
        console.error(err);
      }
    };

    fetchMovies();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="loading-spinner"></div>
      <span className="ml-3">加载中...</span>
    </div>
  );
  
  if (error) return (
    <div className="error bg-red-900/20 text-red-500 p-4 rounded-lg border border-red-800">
      <p>{error}</p>
      <button 
        className="mt-2 text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
        onClick={() => window.location.reload()}
      >
        重试
      </button>
    </div>
  );

  return (
    <div>
      <div className="movie-list">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
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
    </div>
  );
} 