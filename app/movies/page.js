import React from 'react';
import MovieList from '../../components/MovieList';

export default function MoviesPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">电影列表</h1>
      <MovieList />
    </main>
  );
} 