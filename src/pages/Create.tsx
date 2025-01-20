import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sparkles, Palette, ArrowRight, Loader2, ChevronLeft, ChevronRight, Pencil, BookOpen, Download, Share2, Send } from 'lucide-react';

interface StoryPage {
  title?: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  illustrationSettings?: {
    model: string;
    aspectRatio: string;
  };
  titleEn?: string;
  contentEn?: string;
  imagePromptEn?: string;
}

interface ThemeWithType {
  theme: string;
  type?: string;
}

export function Create() {
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'theme' | 'story' | 'illustration-settings' | 'illustration'>('theme');
  const [currentPage, setCurrentPage] = useState(0);
  const [generatedStory, setGeneratedStory] = useState<StoryPage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [randomThemes, setRandomThemes] = useState<ThemeWithType[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);

  // 插画设定状态
  const [illustrationSettings, setIllustrationSettings] = useState({
    model: 'hand_drawn',
    aspectRatio: '16:9',  // 固定为16:9
  });

  // 简化插画模式定义
  const illustrationModels = [
    {
      id: 'hand_drawn',
      name: '手绘',
      thumbnail: '/mod/hand_drawn.png'
    },
    {
      id: 'grain',
      name: '颗粒',
      thumbnail: '/mod/grain.png'
    },
    {
      id: 'clay',
      name: '陶土',
      thumbnail: '/mod/clay.png'
    }
  ];

  // 固定画面比例选项
  const aspectRatios = [
    { value: '16:9', label: '16:9 (1707x1024)', disabled: false }
  ];

  // 添加生成插画的函数
  const generateIllustrations = async (storyPages: StoryPage[]) => {
    setIsGeneratingImages(true);
    try {
      const updatedPages = await Promise.all(
        storyPages.map(async (page) => {
          try {
            const response = await axios.post(
              'https://external.api.recraft.ai/v1/images/generations',
              {
                prompt: page.imagePrompt,
                style: 'digital_illustration',
                substyle: illustrationSettings.model, // 使用选择的风格
                n: 1,
                size: '1707x1024',
                response_format: 'url'
              },
              {
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_RECRAFT_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.data.data?.[0]?.url) {
              return {
                ...page,
                imageUrl: response.data.data[0].url
              };
            }
            return page;
          } catch (error) {
            console.error(`Error generating illustration for page ${page.pageNumber}:`, error);
            return page;
          }
        })
      );

      return updatedPages;
    } catch (error) {
      console.error('Error generating illustrations:', error);
      throw error;
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // 修改handleGenerate函数
  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGeneratedStory([]); // 清空现有故事
    
    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      
      if (!apiKey) {
        throw new Error('API Key is missing');
      }

      const response = await axios.post('https://api.deepseek.com/chat/completions', {
        model: "deepseek-chat",
        messages: [
          {
            role: "system", 
            content: `你是一个专业的儿童绘本故事创作助手。根据给定的主题，请按照以下JSON格式生成6个独特的故事场景：
            {
              "scenes": [
                {
                  "sceneNumber": 1,
                  "nameEN": "Scene Name in English",
                  "nameCN": "场景中文名称",
                  "storyEN": "Detailed story plot in English",
                  "storyCN": "详细的中文故事情节",
                  "imagePromptEN": "Detailed image description in English",
                  "imagePromptCN": "详细的中文图像描述"
                }
                // 另外5个场景...
              ]
            }
            
            要求：
            1. 每个场景都要连贯，推进故事情节
            2. 场景描述生动有趣，适合儿童阅读
            3. 英文和中文描述要意境相近
            4. 图像描述要具体、生动，便于AI绘图`
          },
          {
            role: "user", 
            content: `主题：${theme}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 增加到60秒
      });

      console.log('Story Generation Response:', response.data);

      // 解析API返回的场景
      const parsedResponse = JSON.parse(response.data.choices[0].message.content);
      const generatedScenes = parsedResponse.scenes || [];

      if (generatedScenes.length === 0) {
        throw new Error('No scenes generated');
      }

      // 转换场景为StoryPage格式
      const storyPages: StoryPage[] = generatedScenes.map((scene, index) => ({
        pageNumber: index + 1,
        title: scene.nameCN,
        titleEn: scene.nameEN,
        content: scene.storyCN,
        contentEn: scene.storyEN,
        imagePrompt: scene.imagePromptCN,
        imagePromptEn: scene.imagePromptEN
      }));

      // 先设置故事并跳转到故事预览页
      setGeneratedStory(storyPages);
      setCurrentPage(0);
      setStep('story');

    } catch (error) {
      console.error('Story Generation Error:', error);
      alert('生成故事时出现错误，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 添加处理插画生成的函数
  const handleIllustrationGeneration = async () => {
    if (isGeneratingImages || generatedStory.length === 0) return;

    try {
      // 生成插画
      const pagesWithIllustrations = await generateIllustrations(generatedStory);
      setGeneratedStory(pagesWithIllustrations);
      setStep('illustration');
    } catch (error) {
      console.error('Error generating illustrations:', error);
      alert('生成插画时出现错误，请重试');
    }
  };

  // 在故事预览页的"下一步"按钮点击处理函数
  const handleStoryPreviewNext = () => {
    setStep('illustration-settings');
  };

  // 在插画设定页的"开始生成"按钮点击处理函数
  const handleIllustrationSettingsNext = async () => {
    await handleIllustrationGeneration();
  };

  const handleUpdateIllustrationSettings = (key: string, value: string) => {
    setIllustrationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(generatedStory.length - 1, prev + 1));
  };

  // 修改generateRandomThemes函数，避免重复调用
  const generateRandomThemes = async () => {
    if (isLoadingThemes) return; // 防止重复调用
    
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
            content: "你是一个儿童绘本主题生成专家。你需要生成独特、富有创意的故事主题，每个主题都应该属于不同的类型（如奇幻、科幻、生活、自然、冒险等）。确保主题之间有足够的差异性，避免重复的元素和相似的场景。每个主题必须包含类型标注，格式为：主题（类型）"
          },
          {
            role: "user", 
            content: "请生成6个独特的儿童故事主题，要求：\n1. 每个主题不超过6个字\n2. 每个主题要属于不同的类型，并在括号中标注类型\n3. 避免使用相似的元素\n4. 主题要具有想象力和教育意义\n5. 格式要求：主题（类型），如"云朵裁缝店（奇幻）"\n请用换行分隔每个主题，并确保每个主题都带有类型标注。"
          }
        ],
        max_tokens: 200,
        temperature: 1.0,  // 增加到1.0以获得更多样化的结果
        presence_penalty: 0.6,  // 添加presence_penalty来减少重复
        frequency_penalty: 0.6,  // 添加frequency_penalty来避免常见模式
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
        .filter(line => line.trim())
        .map(theme => {
          const themeText = theme.replace(/^\d+\.?\s*/, '').trim();
          // 提取主题和类型，使用中文括号或英文括号
          const match = themeText.match(/^(.+?)(?:[（(]([^）)]+)[）)])/);
          if (match) {
            return {
              theme: match[1].trim(),
              type: match[2].trim()
            };
          }
          return null;
        })
        .filter(theme => theme !== null);

      console.log('Generated Themes:', themes);
      setRandomThemes(themes.length > 0 ? themes : [
        { theme: "勇敢的小兔子", type: "冒险" },
        { theme: "神秘的森林", type: "奇幻" },
        { theme: "海底冒险", type: "科幻" },
        { theme: "太空旅行", type: "科幻" },
        { theme: "友谊的魔法", type: "生活" },
        { theme: "梦想花园", type: "自然" }
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
        { theme: "勇敢的小兔子", type: "冒险" },
        { theme: "神秘的森林", type: "奇幻" },
        { theme: "海底冒险", type: "科幻" },
        { theme: "太空旅行", type: "科幻" },
        { theme: "友谊的魔法", type: "生活" },
        { theme: "梦想花园", type: "自然" }
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

  // 添加初始化标志
  const isInitialized = useRef(false);

  useEffect(() => {
    // 如果已经初始化过，直接返回
    if (isInitialized.current) {
      return;
    }

    const initThemes = async () => {
      if (randomThemes.length === 0) {
        await generateRandomThemes();
      }
    };

    initThemes();
    isInitialized.current = true;

    // 不需要cleanup函数，因为我们使用ref来控制
  }, []); // 依赖项为空数组

  // 添加测试函数
  const testRecraftAPI = async () => {
    try {
      const response = await axios.post(
        'https://external.api.recraft.ai/v1/images/generations',
        {
          prompt: '一个疯狂的场景，钟表疯狂地滴答作响，指针失控地旋转。一个小女孩和一位老人一起工作，使用工具和智慧来安抚钟表，象征着忙碌生活的减速。',
          style: 'digital_illustration',
          substyle: 'child_book',
          n: 1,
          size: '1707x1024',
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_RECRAFT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Recraft API Response:', response.data);
      if (response.data.data?.[0]?.url) {
        // 显示生成的图片
        const testImage = document.createElement('img');
        testImage.src = response.data.data[0].url;
        testImage.style.maxWidth = '300px';
        testImage.style.border = '2px solid #ccc';
        
        const container = document.getElementById('test-image-container');
        if (container) {
          container.innerHTML = '';
          container.appendChild(testImage);
        }
      }
    } catch (error) {
      console.error('Recraft API Error:', error);
      alert('API调用失败，请检查控制台获取详细信息');
    }
  };

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
                          onClick={() => setTheme(suggestedTheme.theme)}
                          className="group relative p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all text-left overflow-hidden"
                        >
                          {/* 背景装饰 */}
                          <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6 bg-gradient-to-br from-indigo-50 to-transparent rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                          
                          {/* 主题内容 */}
                          <div className="relative">
                            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                              {suggestedTheme.theme}
                            </h3>
                            {suggestedTheme.type && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {suggestedTheme.type}
                              </span>
                            )}
                          </div>
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
            <div className="text-center mt-8">
              <button
                onClick={handleStoryPreviewNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                下一步
              </button>
            </div>
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
                    场景{index + 1} - {page.title} | {page.titleEn}
                  </h3>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-semibold text-blue-700 mb-2">
                    故事
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg mb-2">
                    <p className="text-gray-800">{page.content}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-green-700 mb-2">
                    插画描述
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-800">{page.imagePrompt}</p>
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
            <div className="text-center mt-8">
              <button
                onClick={handleIllustrationSettingsNext}
                disabled={isGeneratingImages}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isGeneratingImages
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isGeneratingImages ? '生成中...' : '开始生成'}
              </button>
            </div>
          </div>

          {/* Illustration Model Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {illustrationModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleUpdateIllustrationSettings('model', model.id)}
                  className={`
                    relative p-4 rounded-xl overflow-hidden
                    border-2 transition-all duration-300
                    ${illustrationSettings.model === model.id 
                      ? 'border-indigo-600 shadow-lg' 
                      : 'border-gray-200 hover:border-indigo-300'}
                  `}
                >
                  <div className="aspect-square mb-3">
                    <img 
                      src={model.thumbnail} 
                      alt={model.name} 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900">{model.name}</h4>
                  </div>
                  {illustrationSettings.model === model.id && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selection - 暂时隐藏或禁用其他选项 */}
          <div className="mb-6" style={{ display: 'none' }}>
            <h3 className="text-lg font-semibold mb-3">画面比例</h3>
            <div className="grid grid-cols-3 gap-4">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => handleUpdateIllustrationSettings('aspectRatio', ratio.value)}
                  disabled={ratio.disabled}
                  className={`
                    px-4 py-2 rounded-lg
                    ${illustrationSettings.aspectRatio === ratio.value
                      ? 'bg-indigo-600 text-white'
                      : ratio.disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-indigo-50'}
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
          {/* 添加测试按钮和显示区域 */}
          <div className="mb-8">
            <button
              onClick={testRecraftAPI}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              测试Recraft API
            </button>
            <div 
              id="test-image-container" 
              className="mt-4 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center"
            >
              <p className="text-gray-500">生成的图片将显示在这里</p>
            </div>
          </div>
          
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