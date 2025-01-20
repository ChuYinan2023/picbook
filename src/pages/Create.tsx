import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Palette, ArrowRight, Loader2, ChevronLeft, ChevronRight, Pencil, BookOpen, Download, Share2, Send } from 'lucide-react';

interface StoryPage {
  title?: string;
  chineseTitle?: string;
  content: string;
  imagePrompt: string;
  imagePromptChinese?: string;
  imageUrl?: string;
  illustrationSettings?: {
    model: string;
    aspectRatio: string;
  };
}

export function Create() {
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'theme' | 'story' | 'illustration-settings' | 'illustration'>('theme');
  const [currentPage, setCurrentPage] = useState(0);
  const [generatedStory, setGeneratedStory] = useState<StoryPage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [randomThemes, setRandomThemes] = useState<string[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);

  // Illustration settings state
  const [illustrationSettings, setIllustrationSettings] = useState({
    model: 'model1',
    aspectRatio: '16:9',
  });

  // Simplified illustration models with small square thumbnails
  const illustrationModels = [
    {
      id: 'model1',
      name: '童话风',
      thumbnail: '/mod/3.png'
    },
    {
      id: 'model2',
      name: '写实风',
      thumbnail: '/mod/4.png'
    },
    {
      id: 'model3',
      name: '水彩风',
      thumbnail: '/mod/5.png'
    },
    {
      id: 'model4',
      name: '卡通风',
      thumbnail: '/mod/3.png'
    },
    {
      id: 'model5',
      name: '素描风',
      thumbnail: '/mod/4.png'
    },
    {
      id: 'model6',
      name: '像素风',
      thumbnail: '/mod/5.png'
    },
    {
      id: 'model7',
      name: '油画风',
      thumbnail: '/mod/3.png'
    },
    {
      id: 'model8',
      name: '漫画风',
      thumbnail: '/mod/4.png'
    },
    {
      id: 'model9',
      name: '剪纸风',
      thumbnail: '/mod/5.png'
    },
    {
      id: 'model10',
      name: '国画风',
      thumbnail: '/mod/3.png'
    }
  ];

  // Simplified aspect ratio options
  const aspectRatios = [
    { value: '16:9', label: '16:9' },
    { value: '4:3', label: '4:3' },
    { value: '1:1', label: '1:1' }
  ];

  const handleGenerate = () => {
    if (!theme.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const story: StoryPage[] = [
        {
          title: "The Lonely Prince's Planet",
          chineseTitle: "孤独王子的星球",
          content: "In the vast, silent universe, there was a tiny planet no larger than a house. On this miniature world lived a very special little prince, who took care of his beloved rose and three tiny volcanoes with utmost dedication.\n\nEvery morning, he would wake up, sweep the volcanoes, and tend to his rose. Despite having everything he needed, a deep sense of loneliness often crept into his heart, making him gaze wistfully at the distant stars.\n\n在广阔寂静的宇宙中，有一颗只有房子大小的小行星。在这个微小的世界上，住着一位非常特别的小王子，他以无比专注的态度照料着自己心爱的玫瑰和三座小火山。\n\n每天早晨，他都会起床，打扫火山，照料玫瑰。尽管拥有所有必需之物，但内心深处的孤独感常常悄然而至，让他怀着渴望的目光凝视遥远的星空。",
          imagePrompt: "A small, round planet floating in a starry background. A delicate rose grows in the center, with three tiny volcanoes nearby. A small, melancholic prince sits at the edge, looking into the vast universe, wearing a light blue coat and golden scarf.",
          imagePromptChinese: "一颗漂浮在繁星背景中的小圆行星。中心生长着一朵娇嫩的玫瑰，周围有三座小火山。一位忧郁的小王子穿着浅蓝色外套和金色围巾，坐在行星边缘，凝望着浩瀚的宇宙。"
        },
        {
          title: "The Unexpected Visitor",
          chineseTitle: "意外的访客",
          content: "One extraordinary day, a golden fox appeared on the little prince's planet. Unlike any fox he had ever seen, this creature seemed to shimmer with an otherworldly light, its fur glowing softly against the dark cosmic background.\n\n'I bring a message from the stars,' the fox said, its voice both melodic and mysterious. The little prince listened intently, his heart racing with anticipation of an adventure beyond his tiny, familiar world.\n\nThe fox's words were like a key that unlocked a door in the prince's mind, revealing a universe full of wonder and magic.\n\n在一个非同寻常的日子里，一只金色的狐狸出现在小王子的星球上。这个生物与他曾见过的任何狐狸都不同，似乎散发着超凡脱俗的光芒，它柔软的毛皮在黑暗的宇宙背景中轻轻发光。\n\n'我带来了来自星空的讯息，'狐狸说道，它的声音既悦耳又神秘。小王子专注地倾听，心中充满了对未知世界的期待和冒险的渴望。\n\n狐狸的话语如同一把钥匙，打开了小王子心中的门扉，展现出一个充满奇迹和魔法的宇宙。",
          imagePrompt: "A mystical golden fox with luminescent fur standing on the small planet, facing the little prince. Starry background with subtle cosmic swirls. The fox appears to be speaking, with the prince looking both surprised and intrigued.",
          imagePromptChinese: "一只毛皮发光的神秘金色狐狸站在小行星上，面对小王子。背景是布满细微宇宙旋涡的星空。狐狸似乎正在说话，小王子既惊讶又好奇。"
        },
        {
          title: "Journey Beyond the Known",
          chineseTitle: "超越已知的旅程",
          content: "Guided by the golden fox's cryptic words, the little prince prepared for a journey. He packed only the essentials: a small water flask, a sketch of his rose, and an old compass that seemed to point not to north, but to 'possibility'.\n\nAs he stepped onto a passing comet, he realized that sometimes, the greatest adventures begin with a single, courageous step into the unknown.\n\n在金色狐狸神秘的话语指引下，小王子开始准备旅程。他只带了必需品：一个小水壶，一张玫瑰的素描，以及一个看似不指向北方，而是指向'可能性'的老指南针。\n\n当他踏上一颗经过的彗星时，他意识到，有时，最伟大的冒险始于对未知的勇敢一步。",
          imagePrompt: "The little prince standing on the edge of a bright, streaming comet, with the golden fox beside him. His small bag is packed, and he looks determined yet slightly nervous. Stars and cosmic dust swirl around them, creating a sense of magical transition.",
          imagePromptChinese: "小王子站在一颗明亮的流星边缘，金色狐狸站在他身边。他的小包已经准备好，他看起来既果断又略微紧张。周围的星星和宇宙尘埃在他们周围旋转，创造出一种神奇的过渡感。"
        },
        {
          title: "The Asteroid Kingdom",
          chineseTitle: "小行星王国",
          content: "The comet carried the little prince to a strange asteroid populated by peculiar beings. Here, inhabitants were obsessed with counting and classifying everything, losing sight of the beauty and wonder around them.\n\nThe little prince watched in bewilderment as bureaucrats meticulously measured and labeled rocks, stars, and even their own shadows, never pausing to appreciate the magic of existence.\n\n彗星将小王子带到一颗奇怪的小行星上，这里居住着一群古怪的生灵。这些居民沉迷于计数和分类一切，以至于忽视了周围的美丽与奇迹。\n\n小王子目瞪口呆地看着官僚们仔细地测量和标记岩石、星星，甚至自己的影子，从不停下来欣赏存在的魔力。",
          imagePrompt: "A surreal landscape of an asteroid with geometric shapes and lines everywhere. Bureaucratic figures with clipboards and measuring tools, meticulously organizing everything. The little prince stands to the side, looking perplexed and slightly sad.",
          imagePromptChinese: "一个充满几何形状和线条的超现实小行星景观。官僚们带着剪贴板和测量工具，仔细地组织着一切。小王子站在一旁，看起来困惑和略微悲伤。"
        },
        {
          title: "The Rose's Memory",
          chineseTitle: "玫瑰的回忆",
          content: "As night fell on the asteroid, the little prince dreamed of his beloved rose back home. He remembered her delicate petals, her unique beauty, and the love that made her special in his eyes.\n\nIn his dream, the rose spoke to him: 'You are responsible forever for what you have tamed.' These words echoed through the cosmic silence, reminding him of the connections that truly matter.\n\n当夜幕降临在小行星上时，小王子梦见了家乡那朵心爱的玫瑰。他回忆起她娇嫩的花瓣，她独特的美丽，以及让她在他眼中如此特别的爱。\n\n在他的梦中，玫瑰对他说：'你将永远为你驯服的东西负责。'这些话在宇宙的寂静中回荡，提醒他真正重要的联系。",
          imagePrompt: "A dreamlike scene with a giant, luminescent rose floating in a starry background. The little prince appears as a small silhouette, reaching out towards the rose. Soft, ethereal light surrounds the image.",
          imagePromptChinese: "一个梦幻般的场景，一个巨大的、发光的玫瑰漂浮在星空背景中。小王子作为一个小剪影，伸出手向玫瑰。柔软的、空灵的光环围绕着图像。"
        },
        {
          title: "The Final Revelation",
          chineseTitle: "最后的启示",
          content: "As his journey neared its end, the little prince understood that true wealth lies not in possessions, but in the relationships we nurture and the moments we cherish.\n\nThe golden fox appeared one last time, whispering: 'What makes the desert beautiful is that somewhere it hides a well.' The prince smiled, knowing that meaning is found in the heart, not in the vastness of space.\n\n当他的旅程接近尾声时，小王子明白了真正的财富并不在于拥有什么，而在于我们培育的关系和珍惜的瞬间。\n\n金色的狐狸最后一次出现，低语道：'让沙漠变得美丽的，是它在某处隐藏了一口水井。'小王子微笑了，知道意义存在于心中，而非浩瀚的宇宙。",
          imagePrompt: "The little prince standing at a cosmic crossroads, with the golden fox beside him. Around them, fragments of his journey float like memories - his rose, the asteroid, the stars. A sense of wisdom and peaceful understanding radiates from the scene.",
          imagePromptChinese: "小王子站在宇宙的十字路口，金色狐狸站在他身边。周围漂浮着他旅程的碎片，如同回忆——他的玫瑰、小行星、星星。场景中散发出智慧和平和的理解。"
        }
      ];
      
      setGeneratedStory(story);
      setIsGenerating(false);
      setStep('story');
    }, 2000);
  };

  const handleUpdateIllustrationSettings = (key: string, value: string) => {
    setIllustrationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerateIllustrations = () => {
    setIsGeneratingImages(true);
    setCurrentPage(0); // 重置到第一页

    // Use the correct path for picbook images with settings
    const illustrationUrls = generatedStory.map((_, index) => {
      // Default to existing image path if no specific style/ratio is available
      return `/picbook/scene_${index + 1}.png`;
    });
    
    const storyWithImages = generatedStory.map((page, index) => ({
      ...page,
      imageUrl: illustrationUrls[index],
      // Store illustration settings with the story for potential future use
      illustrationSettings: illustrationSettings
    }));
    
    setGeneratedStory(storyWithImages);
    setIsGeneratingImages(false);
    setStep('illustration');
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(generatedStory.length - 1, prev + 1));
  };

  const generateRandomThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      
      // 开发环境详细日志
      console.log('Complete Environment:', import.meta.env);
      console.log('API Key Full Value:', apiKey);

      console.log('API Key (first 5 chars):', apiKey?.substring(0, 5) || 'N/A');
      console.log('API Key Length:', apiKey?.length || 0);
      console.log('Attempting to generate themes...');

      if (!apiKey) {
        throw new Error(`
          API Key is missing. 
          Please check your .env file and ensure:
          1. The file is named exactly '.env'
          2. Contains VITE_DEEPSEEK_API_KEY=your_api_key
          3. Restart the development server
        `);
      }

      const response = await axios.post('https://api.deepseek.com/chat/completions', {
        model: "deepseek-chat",
        messages: [
          {
            role: "system", 
            content: "你是一个儿童绘本主题生成专家。请生成6个适合儿童的、富有想象力的故事主题。主题应该简洁、有趣、能激发孩子的好奇心。"
          },
          {
            role: "user", 
            content: "请给我6个独特的儿童故事主题，每个主题不超过6个字。用换行分隔每个主题。"
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('Full API Response:', JSON.stringify(response.data, null, 2));

      const themes = response.data.choices[0].message.content
        .split('\n')
        .map(theme => theme.replace(/^\d+\.?\s*/, '').trim())
        .filter(theme => theme.length > 0 && theme.length <= 6);

      console.log('Generated Themes:', themes);
      setRandomThemes(themes.length > 0 ? themes : [
        "勇敢的小兔子",
        "神秘的森林",
        "海底冒险",
        "太空旅行",
        "友谊的魔法",
        "梦想花园"
      ]);
    } catch (error) {
      console.error('Complete Error Object:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          message: error.message,
          status: error.response?.status,
          data: JSON.stringify(error.response?.data, null, 2),
          headers: error.response?.headers
        });
      }

      // 如果API调用失败，提供默认主题
      setRandomThemes([
        "勇敢的小兔子",
        "神秘的森林",
        "海底冒险",
        "太空旅行",
        "友谊的魔法",
        "梦想花园"
      ]);
    } finally {
      setIsLoadingThemes(false);
    }
  };

  const handleNextTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % randomThemes.length);
  };

  const handlePrevTheme = () => {
    setCurrentThemeIndex((prev) => 
      prev === 0 ? randomThemes.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    generateRandomThemes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className={`flex items-center ${step === 'theme' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">
            1
          </div>
          <span className="ml-2">选择主题</span>
        </div>
        <ArrowRight className="mx-4 text-gray-400" />
        <div className={`flex items-center ${step === 'story' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">
            2
          </div>
          <span className="ml-2">生成故事</span>
        </div>
        <ArrowRight className="mx-4 text-gray-400" />
        <div className={`flex items-center ${step === 'illustration-settings' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">
            3
          </div>
          <span className="ml-2">插画设定</span>
        </div>
        <ArrowRight className="mx-4 text-gray-400" />
        <div className={`flex items-center ${step === 'illustration' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">
            4
          </div>
          <span className="ml-2">生成绘本</span>
        </div>
      </div>

      {step === 'theme' ? (
        /* Theme Input Section */
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-indigo-900">创作主题</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                你想创作一个什么样的故事？
              </label>
              <input
                type="text"
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例如：一只爱冒险的小兔子..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-3">
                <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-indigo-900">灵感主题</h3>
              </div>
              
              <div className="relative w-full">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {isLoadingThemes ? (
                    Array(6).fill(0).map((_, index) => (
                      <div 
                        key={index} 
                        className="p-4 bg-gray-100 rounded-lg animate-pulse"
                      >
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    ))
                  ) : (
                    randomThemes.length > 0 ? (
                      randomThemes.map((suggestedTheme, index) => (
                        <button
                          key={index}
                          onClick={() => setTheme(suggestedTheme)}
                          className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all text-left"
                        >
                          <h3 className="font-medium text-gray-900">{suggestedTheme}</h3>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-500">
                        暂无主题，点击刷新按钮重新生成
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerate}
                disabled={!theme.trim() || isGenerating}
                className={`flex items-center justify-center px-6 py-3 rounded-full text-white text-lg transition-all transform hover:scale-105 ${
                  theme.trim() && !isGenerating
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Palette className="mr-2 h-5 w-5" />
                    开始创作
                  </>
                )}
              </button>
              <button
                onClick={() => setTheme('')}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      ) : step === 'story' ? (
        /* Story Display Section */
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-indigo-900">故事预览</h2>
            <button
              onClick={() => setStep('illustration-settings')}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              <Palette className="mr-2 h-5 w-5" />
              插画设定
            </button>
          </div>

          {/* All Story Pages in Single View */}
          <div className="space-y-8">
            {generatedStory.map((page, index) => (
              <div 
                key={index} 
                className="w-full p-8 rounded-lg bg-white shadow-inner mb-4 border border-gray-100"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-indigo-900 mb-2">
                    Scene {index + 1} - {page.title || '未命名场景'} | {page.chineseTitle || '未命名场景'}
                  </h3>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-semibold text-blue-700 mb-2">
                    Text
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg mb-2">
                    <p className="text-gray-800">{page.content}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-green-700 mb-2">
                    Illustration description
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-600 italic">
                      {page.imagePrompt}
                    </p>
                    <p className="text-gray-600 italic">
                      {page.imagePromptChinese}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : step === 'illustration-settings' ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Palette className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-indigo-900">插画设定</h2>
            </div>
            <button 
              onClick={handleGenerateIllustrations}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              生成绘本
            </button>
          </div>

          {/* Illustration Model Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">选择模型</h3>
            <div className="grid grid-cols-5 gap-1">
              {illustrationModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleUpdateIllustrationSettings('model', model.id)}
                  className={`
                    relative w-full aspect-square rounded-lg overflow-hidden
                    border-2 transition-all duration-300
                    ${illustrationSettings.model === model.id 
                      ? 'border-indigo-600 shadow-lg' 
                      : 'border-gray-200 hover:border-indigo-300'}
                  `}
                >
                  <img 
                    src={model.thumbnail} 
                    alt={model.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-[10px] py-0.5">
                    {model.name}
                  </div>
                  {illustrationSettings.model === model.id && (
                    <div className="absolute top-0.5 right-0.5 bg-indigo-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">画面比例</h3>
            <div className="grid grid-cols-3 gap-3">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => handleUpdateIllustrationSettings('aspectRatio', ratio.value)}
                  className={`
                    px-4 py-2 rounded-lg 
                    border-2 transition-all duration-300
                    ${illustrationSettings.aspectRatio === ratio.value 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 hover:border-indigo-300'}
                  `}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={() => setStep('story')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      ) : (
        /* Storybook Preview Section */
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          {isGeneratingImages ? (
            <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
              <p className="text-lg text-gray-600">正在生成绘本...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-indigo-900">绘本预览</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>下载绘本</span>
                  </button>
                  <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center space-x-2">
                    <Share2 className="h-4 w-4" />
                    <span>分享</span>
                  </button>
                  <button className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>发布作品</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-8">
                {/* Main Preview */}
                <div className="flex-1">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
                    <div className="aspect-[16/9] relative">
                      <img
                        src={generatedStory[currentPage]?.imageUrl}
                        alt={`Page ${currentPage + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-base leading-snug mb-1 line-clamp-2">
                          {generatedStory[currentPage]?.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails moved to bottom */}
                  <div className="flex justify-center space-x-4 mt-4">
                    {generatedStory.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-24 aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all ${
                          currentPage === index
                            ? 'border-indigo-600 shadow-lg scale-105'
                            : 'border-transparent hover:border-indigo-300'
                        }`}
                      >
                        <img
                          src={page.imageUrl}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}