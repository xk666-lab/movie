"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import MovieCard from '../../components/MovieCard';

export default function Movies() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialGenre = searchParams.get('genre') || '';
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [genre, setGenre] = useState(initialGenre);
  const [genres, setGenres] = useState([]);

  // 获取所有电影类型
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies/genres/all');
        if (response.data.success) {
          const uniqueGenres = [...new Set(response.data.data.map(item => item.hx_genre))];
          setGenres(uniqueGenres);
        }
      } catch (error) {
        console.error('获取电影类型失败:', error);
        // 设置一些默认类型
        setGenres(['动作', '剧情', '科幻', '喜剧', '恐怖', '爱情']);
      }
    };

    fetchGenres();
  }, []);

  // 获取电影列表
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        let url = `http://localhost:5000/api/movies?page=${page}&limit=12`;
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        if (genre) {
          url += `&genre=${encodeURIComponent(genre)}`;
        }
        
        const response = await axios.get(url);
        if (response.data.success) {
          setMovies(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError('获取电影数据失败');
        }
      } catch (err) {
        setError('获取电影数据失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, searchTerm, genre]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1); // 重置到第一页
  };

  const handleGenreChange = (selectedGenre) => {
    if (genre === selectedGenre) {
      setGenre(''); // 如果点击当前选中的类型，则取消选择
    } else {
      setGenre(selectedGenre);
    }
    setPage(1); // 重置到第一页
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">探索电影</h1>
        
        <div className="search-filter-container mb-8">
          <form onSubmit={handleSearch} className="search-form mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索电影..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full p-3 pl-10 bg-[var(--card-bg)] border border-gray-700 rounded-lg focus:outline-none focus:border-[var(--accent-color)]"
              />
              <button type="submit" className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
          
          <div className="genre-filter mb-6">
            <h3 className="text-lg font-semibold mb-3">电影类型</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((item) => (
                <button
                  key={item}
                  onClick={() => handleGenreChange(item)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    genre === item
                      ? 'bg-[var(--accent-color)] text-black font-medium'
                      : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-bg)]/80'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          
          {(searchTerm || genre) && (
            <div className="active-filters mb-4 flex items-center">
              <span className="text-[var(--text-secondary)] mr-2">筛选条件:</span>
              <div className="flex gap-2">
                {searchTerm && (
                  <div className="filter-tag bg-[var(--card-bg)] px-3 py-1 rounded-full text-sm flex items-center">
                    <span className="mr-1">搜索: {searchTerm}</span>
                    <button onClick={() => setSearchTerm('')} className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {genre && (
                  <div className="filter-tag bg-[var(--card-bg)] px-3 py-1 rounded-full text-sm flex items-center">
                    <span className="mr-1">类型: {genre}</span>
                    <button onClick={() => setGenre('')} className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-[var(--text-secondary)]">加载中...</span>
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
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">没有找到符合条件的电影</h3>
            <p className="text-[var(--text-secondary)]">请尝试其他搜索词或筛选条件</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSearchInput('');
                setGenre('');
              }}
              className="mt-4 px-6 py-2 border border-[var(--accent-color)] text-[var(--accent-color)] rounded-full hover:bg-[var(--accent-color)] hover:text-black transition-colors"
            >
              清除所有筛选
            </button>
          </div>
        ) : (
          <>
            <div className="movie-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination flex justify-center mt-12 space-x-2">
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
    </main>
    </div>
  );
} 