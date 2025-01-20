import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, Users, Palette, Wand as MagicWand, 
  BookOpen, Star, Zap, Globe, Rocket, 
  ArrowRight, Play, Layers, PlusCircle
} from 'lucide-react';
import { storyService, Story } from '../services/storyService';
import { authService } from '../services/authService';

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group">
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-indigo-900 mb-2 group-hover:text-indigo-700 transition-colors">{title}</h3>
      <p className="text-gray-600 group-hover:text-gray-800 transition-colors">{description}</p>
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  if (!story) {
    return null;
  }
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all group">
      <div className="relative overflow-hidden">
        <div className="w-full h-48">
          {story.imageUrl ? (
            <img
              src={story.imageUrl}
              alt={story.title || '故事封面'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h4 className="text-white font-bold text-lg">{story.title || '未命名故事'}</h4>
          <p className="text-white/70 text-sm">
            创建于 {new Date(story.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [userStories, setUserStories] = useState<Story[]>([]);
  const isLoggedIn = authService.isAuthenticated();

  useEffect(() => {
    if (isLoggedIn) {
      const stories = storyService.getUserStories();
      setUserStories(stories);
    }
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 pb-24">
      {/* 欢迎区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            创作你的专属绘本
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            使用 AI 技术，让创作变得简单而有趣。从创意主题到精美插画，一键生成你的故事。
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/create"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                开始创作
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 用户作品区域 */}
      {isLoggedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">我的作品</h2>
              <p className="mt-1 text-gray-500">这里展示了您创作的所有绘本作品</p>
            </div>
          </div>

          {userStories.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无作品</h3>
              <p className="mt-1 text-sm text-gray-500">开始创作您的第一本绘本吧</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  创建绘本
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStories.map((story) => (
                <Link key={story.id} to={`/story/${story.id}`}>
                  <StoryCard story={story} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}



      {/* 特性展示区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          为什么选择StoryMagic
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
              title: "个性化绘本",
              description: "用AI助力，轻松创作专属故事"
            },
            {
              icon: <Palette className="h-6 w-6 text-green-600" />,
              title: "智能插画",
              description: "AI生成与故事完美契合的画面"
            },
            {
              icon: <Globe className="h-6 w-6 text-blue-600" />,
              title: "多语言支持",
              description: "中英双语，跨文化阅读体验"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="transform transition-all hover:-translate-y-2 hover:scale-105"
            >
              <FeatureCard 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center space-x-4 mb-12">
          {[
            { id: 'featured', label: '精选作品', icon: <Star className="h-5 w-5" /> }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => navigate(`/${section.id}`)}
              className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-all ${
                section.id === 'featured' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { 
              image: "/examples/story1.png", 
              title: "金色麦田的王子", 
              author: "编辑推荐"
            },
            { 
              image: "/examples/story2.png", 
              title: "地下王国", 
              author: "编辑推荐"
            },
            { 
              image: "/examples/story3.png", 
              title: "星球旅行", 
              author: "编辑推荐"
            }
          ].map((item, index) => (
            <Link key={index} to={`/story/${index}`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
                <div className="relative">
                  <div className="aspect-[4/3] w-full">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || '故事封面'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{item.author}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          为什么选择StoryMagic
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
              title: "个性化绘本",
              description: "用AI助力，轻松创作专属故事"
            },
            {
              icon: <Palette className="h-6 w-6 text-green-600" />,
              title: "智能插画",
              description: "AI生成与故事完美契合的画面"
            },
            {
              icon: <Globe className="h-6 w-6 text-blue-600" />,
              title: "多语言支持",
              description: "中英双语，跨文化阅读体验"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="transform transition-all hover:-translate-y-2 hover:scale-105"
            >
              <FeatureCard 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes backgroundShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-background-shift {
          background-size: 200% 200%;
          animation: backgroundShift 15s ease infinite;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}