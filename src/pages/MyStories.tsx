import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyService, Story } from '../services/storyService';
import { authService } from '../services/authService';
import { Book, Trash2, Edit, Search, PlusCircle, Grid, List, Eye, Calendar, BookOpen } from 'lucide-react';

function StoryCard({ story, onView, onDelete }: { 
  story: Story;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-pointer relative"
         onClick={onView}>
      {/* 删除按钮 */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 z-10 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="删除"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="relative overflow-hidden">
        <div className="w-full h-48">
          {story.pages && story.pages[0]?.imageUrl ? (
            <img
              src={story.pages[0].imageUrl}
              alt={story.title || '故事封面'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h4 className="text-white font-bold text-lg">{story.title || '未命名故事'}</h4>
          <div className="flex items-center text-white/70 text-sm space-x-3">
            <span className="flex items-center">
              <Book className="h-4 w-4 mr-1" />
              {story.pages?.length || 0} 页
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(story.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  useEffect(() => {
    const checkAuthAndLoadStories = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        if (!isAuth) {
          navigate('/login');
          return;
        }

        // 获取当前用户的故事
        const userPhone = localStorage.getItem('userPhone');
        const allStories = JSON.parse(localStorage.getItem('stories') || '[]');
        const userStories = allStories.filter((story: Story) => story.userId === userPhone);
        
        setStories(userStories);
      } catch (error) {
        console.error('加载故事失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadStories();
  }, [navigate]);

  const handleDeleteStory = (storyId: string) => {
    const confirmed = window.confirm('确定要删除这个绘本吗？');
    if (confirmed) {
      const updatedStories = stories.filter(story => story.id !== storyId);
      setStories(updatedStories);
      localStorage.setItem('stories', JSON.stringify(updatedStories));
    }
  };

  const handleViewStory = (storyId: string) => {
    navigate(`/story/${storyId}`);
  };

  // 过滤和排序故事
  const filteredAndSortedStories = stories
    .filter(story => 
      story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.theme?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (a.title || '').localeCompare(b.title || '');
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">加载中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的绘本</h1>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative flex-1 md:max-w-xs">
              <input
                type="text"
                placeholder="搜索绘本..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* 排序选择 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date">按日期排序</option>
              <option value="title">按标题排序</option>
            </select>

            {/* 视图切换 */}
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* 创建新绘本按钮 */}
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              新建绘本
            </button>
          </div>
        </div>
        
        {stories.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg max-w-7xl mx-auto">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {filteredAndSortedStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onView={() => handleViewStory(story.id)}
                onDelete={() => handleDeleteStory(story.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}