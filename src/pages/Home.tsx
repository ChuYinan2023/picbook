import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Users, Palette, Wand as MagicWand, 
  BookOpen, Star, Zap, Globe, Rocket, 
  ArrowRight, Play, Layers 
} from 'lucide-react';

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

function StoryCard({ imageUrl, title, author, aspectRatio }: { 
  imageUrl: string, 
  title: string, 
  author: string,
  aspectRatio: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all group">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className={`w-full object-cover aspect-${aspectRatio} group-hover:scale-110 transition-transform`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h4 className="text-white font-bold text-lg">{title}</h4>
          <p className="text-white/70 text-sm">by {author}</p>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('featured');

  const features = [
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
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
      {/* Hero Section */}
      <div className="text-center relative overflow-hidden">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-20 animate-pulse">
          <Sparkles className="h-24 w-24 text-yellow-500" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 to-purple-100/30 -z-10 animate-background-shift"></div>
        <h1 className="text-5xl font-bold text-indigo-900 mb-6 animate-fade-in relative">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            创造属于你的神奇故事！
          </span>
          <div className="absolute -top-2 -right-10 text-4xl opacity-30">✨</div>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up">
          让我们一起用想象力创造独特的绘本故事，每一页都是充满魔法的冒险！
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/create')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center space-x-2 group shadow-lg hover:shadow-xl"
          >
            <Play className="h-5 w-5 group-hover:rotate-[360deg] transition-transform" />
            <span>开始创作</span>
          </button>
          <button className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 flex items-center space-x-2 group shadow-lg hover:shadow-xl">
            <Layers className="h-5 w-5 group-hover:rotate-[360deg] transition-transform" />
            <span>浏览灵感库</span>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-24 relative">
        <div className="absolute -top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
        <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12 animate-slide-up">
          为什么选择StoryMagic
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
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
      <div className="mt-24">
        <div className="flex justify-center space-x-4 mb-12">
          {[
            { id: 'featured', label: '精选作品', icon: <Star className="h-5 w-5" /> },
            { id: 'myworks', label: '我的作品', icon: <MagicWand className="h-5 w-5" /> }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-all ${
                activeSection === section.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-6 gap-4">
          {(activeSection === 'featured' ? [
            { 
              image: "/imgs/little-prince-in-blue-coat-standing-in-golden-whea.png", 
              title: "金色麦田的王子", 
              description: "一个小王子在金色的麦田中漫步，寻找内心的宁静与梦想。",
              author: "AI创作",
              aspectRatio: '16:9'
            },
            { 
              image: "/imgs/snow-white-running-through-magical-forest--woodlan.png", 
              title: "森林中的雪白", 
              description: "雪白穿越神秘森林，与奇幻生物相遇，寻找真正的勇气。",
              author: "社区精选",
              aspectRatio: '9:16'
            },
            { 
              image: "/imgs/kind-farmer-finding-frozen-snake-in-snowy-field--w.png", 
              title: "雪地里的善良", 
              description: "农夫在寒冷的雪地中发现一条冰冻的蛇，温暖与同情的故事。",
              author: "编辑推荐",
              aspectRatio: '1:1'
            }
          ] : [
            { 
              image: "/imgs/------the-underground-kingdom---------------------.png", 
              title: "地下王国", 
              description: "探索隐藏在地下的神秘王国，揭开古老的传说与秘密。",
              author: "我的创作",
              aspectRatio: '9:16'
            },
            { 
              image: "/imgs/little-prince-in-blue-coat-standing-in-golden-whea.png", 
              title: "星球旅行", 
              description: "穿越宇宙，在不同的星球间探索奇妙的冒险旅程。",
              author: "我的故事",
              aspectRatio: '16:9'
            }
          ]).map((story, index) => (
            <StoryCard 
              key={index} 
              imageUrl={story.image} 
              title={story.title} 
              author={story.author}
              aspectRatio={story.aspectRatio}
            />
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