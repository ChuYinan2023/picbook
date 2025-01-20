import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyService, Story } from '../services/storyService';
import { authService } from '../services/authService';
import { Book, Trash2, Edit } from 'lucide-react';

export function MyStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查登录状态
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // 获取当前用户的故事
    const userPhone = localStorage.getItem('userPhone');
    const allStories = JSON.parse(localStorage.getItem('stories') || '[]');
    const userStories = allStories.filter((story: Story) => story.userId === userPhone);
    
    setStories(userStories);
    setIsLoading(false);
  }, [navigate]);

  const handleDeleteStory = (storyId: string) => {
    const confirmed = window.confirm('确定要删除这个绘本吗？');
    if (confirmed) {
      const updatedStories = stories.filter(story => story.id !== storyId);
      setStories(updatedStories);
      localStorage.setItem('stories', JSON.stringify(updatedStories));
    }
  };

  const handleEditStory = (story: Story) => {
    // 跳转到编辑页面，传递故事ID
    navigate(`/create/${story.id}`);
  };

  const handleViewStory = (storyId: string) => {
    navigate(`/story/${storyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">加载中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">我的绘本</h1>
        
        {stories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <Book className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">你还没有创建任何绘本</p>
            <button 
              onClick={() => navigate('/create')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              创建第一本绘本
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div 
                key={story.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div 
                  className="aspect-[16/9] bg-cover bg-center cursor-pointer"
                  style={{ 
                    backgroundImage: `url(${(story.pages && story.pages.length > 0 && story.pages[0].imageUrl) || '/default-book-cover.png'})` 
                  }}
                  onClick={() => handleViewStory(story.id)}
                />
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{story.title || '未命名绘本'}</h2>
                  <p className="text-gray-600 mb-4">
                    {story.pages?.length || 0} 页 | 创建于 {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewStory(story.id)}
                      className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition"
                    >
                      查看
                    </button>
                    <button 
                      onClick={() => handleEditStory(story)}
                      className="px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStory(story.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}