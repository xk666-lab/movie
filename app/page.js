import React from 'react';
import Image from "next/image";
import Navbar from '../components/Navbar';
import MovieList from '../components/MovieList';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="hero-section">
          <div className="hero-background"></div>
          <div className="hero-content">
            <h1 className="hero-title">探索电影的艺术</h1>
            <p className="hero-subtitle">发现最好的电影和最真实的评论，让每一次观影都成为一次难忘的体验</p>
            <div className="hero-search">
              <input 
                type="text" 
                placeholder="搜索电影、导演或演员..." 
                className="w-full"
              />
            </div>
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="section-title">热门电影</h2>
          <MovieList />
        </section>
        
        <section className="mb-16">
          <h2 className="section-title">最新评论</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="review-card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-secondary)] opacity-70 mr-3"></div>
                <div>
                  <h4 className="font-bold">影评人小王</h4>
                  <p className="text-sm text-[var(--text-secondary)]">2023年10月15日</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">肖申克的救赎</h3>
              <div className="flex mb-3">
                <span className="text-[var(--accent-color)] neon-text">★★★★★</span>
                <span className="ml-2 text-[var(--accent-color)]">9.5/10</span>
              </div>
              <p className="text-[var(--text-secondary)]">这部电影真的很棒，情节扣人心弦，演员表演精湛。强烈推荐给所有电影爱好者！希望能有更多这样的作品出现。</p>
            </div>
            
            <div className="review-card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-color)] opacity-70 mr-3"></div>
                <div>
                  <h4 className="font-bold">电影达人</h4>
                  <p className="text-sm text-[var(--text-secondary)]">2023年10月12日</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">教父</h3>
              <div className="flex mb-3">
                <span className="text-[var(--accent-color)] neon-text">★★★★★</span>
                <span className="ml-2 text-[var(--accent-color)]">9.2/10</span>
              </div>
              <p className="text-[var(--text-secondary)]">经典中的经典，每一次重看都有新的发现。马龙·白兰度的表演无可挑剔。这部电影定义了黑帮片的标准。</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-opacity-10 border-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4 gradient-text">加入我们的社区</h2>
                <p className="text-[var(--text-secondary)] mb-6">分享你的观点，与其他电影爱好者交流，发现更多优质电影。</p>
                <button className="login-button glow-effect">
                  <span className="relative z-10">立即注册</span>
                </button>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-secondary)] opacity-20"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-[var(--card-bg)] py-8 mt-auto border-t border-opacity-10 border-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-[var(--accent-color)]">影评空间</h3>
              <p className="text-[var(--text-secondary)] mt-2">发现电影的无限可能</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">关于我们</a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">隐私政策</a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]">联系我们</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-[var(--text-secondary)]">
            <p>© 2023 影评空间 - 所有权利保留</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
