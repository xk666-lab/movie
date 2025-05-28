import React from 'react';
import '../styles/components.css';

export default function MovieCard({ movie }) {
  // 提取年份
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  
  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img 
          src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'} 
          alt={`${movie.hx_title} 海报`} 
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />
        <div className="movie-rating-badge neon-text">
          {movie.rating}/10
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.hx_title}</h3>
        <div className="movie-meta">
          <span className="movie-genre">{movie.hx_genre}</span>
          <span className="movie-year">{releaseYear}</span>
        </div>
        <p className="movie-description">{movie.hx_description}</p>
        <button className="movie-action-btn">
          查看详情
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
} 