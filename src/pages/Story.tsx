import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { storyService, Story as StoryData, StoryPage } from '../services/storyService';

export function Story() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      try {
        const storyData = storyService.getStory(id);
        if (storyData) {
          if (!storyData.pages || storyData.pages.length === 0) {
            setError('此绘本没有页面内容');
            return;
          }
          setStory(storyData);
        } else {
          setError('未找到指定的绘本');
        }
      } catch (err) {
        setError('加载绘本时发生错误');
        console.error(err);
      }
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">出错了</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">加载中...</h2>
        </div>
      </div>
    );
  }

  const goToNextPage = () => {
    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentStoryPage = story.pages[currentPage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 标题区域 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>返回</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
        </div>

        {/* 绘本内容区域 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-[3/2] relative">
            <img
              src={currentStoryPage.imageUrl}
              alt={`第 ${currentPage + 1} 页`}
              className="w-full h-full object-cover"
            />
            
            {/* 文字叠加区域 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xl font-normal text-white leading-relaxed tracking-normal 
                            bg-black/50 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-sm">
                {currentStoryPage.content}
              </p>
            </div>
            
            {/* 翻页按钮 */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className={`p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg ${
                  currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
                }`}
              >
                <ChevronLeft className="h-6 w-6 text-gray-900" />
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === story.pages.length - 1}
                className={`p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg ${
                  currentPage === story.pages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
                }`}
              >
                <ChevronRight className="h-6 w-6 text-gray-900" />
              </button>
            </div>
          </div>

          {/* 缩略图导航 */}
          <div className="px-4 py-3 bg-gray-50 relative flex items-center justify-center space-x-3 overflow-x-auto">
            <button 
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className={`absolute left-4 z-10 p-1 rounded-full bg-white/80 shadow-md ${
                currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
              }`}
            >
              <ChevronLeft className="h-5 w-5 text-gray-900" />
            </button>
            <div className="flex space-x-3 overflow-x-auto">
              {story.pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`flex-shrink-0 w-24 h-[5.25rem] rounded-lg overflow-hidden transition-all duration-200 ${
                    currentPage === index 
                      ? 'ring-2 ring-indigo-500 scale-105' 
                      : 'hover:ring-1 hover:ring-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={page.imageUrl}
                    alt={`第 ${index + 1} 页缩略图`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <button 
              onClick={goToNextPage}
              disabled={currentPage === story.pages.length - 1}
              className={`absolute right-4 z-10 p-1 rounded-full bg-white/80 shadow-md ${
                currentPage === story.pages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
              }`}
            >
              <ChevronRight className="h-5 w-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
