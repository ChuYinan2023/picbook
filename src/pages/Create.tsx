import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Palette, ArrowRight, Loader2, ChevronLeft, ChevronRight, Pencil, BookOpen, Download, Share2, Send, Save } from 'lucide-react';
import { storyService } from '../services/storyService';
import { authService } from '../services/authService';
import { getRandomInspirations, Inspiration } from '../data/inspirations';

interface StoryPage {
  title?: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  illustrationSettings?: {
    model: string;
    aspectRatio: string;
    style: string;
    substyle: string;
  };
  titleEn?: string;
  contentEn?: string;
  imagePromptEn?: string;
}

interface ThemeWithType {
  theme: string;
  type?: string;
}

interface AspectRatio {
  id: string;
  name: string;
  value: string;
  width: number;
  height: number;
  label: string;
}

export function Create() {
  const navigate = useNavigate(); // 确保在顶部初始化

  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'theme' | 'story' | 'illustration-settings' | 'illustration'>('theme');
  const [currentPage, setCurrentPage] = useState(0);
  const [generatedStory, setGeneratedStory] = useState<StoryPage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [randomThemes, setRandomThemes] = useState<Inspiration[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);

  // 插画设定状态
  const [illustrationSettings, setIllustrationSettings] = useState({
    model: 'recraftv3',
    aspectRatio: '1707x1024',  // 更新为具体尺寸
    style: 'digital_illustration',
    substyle: 'hand_drawn',
    aspectRatioId: '16:9',
    selectedId: 'hand_drawn'  // 添加选中的id
  });

  // 使用 useCallback 确保 handleSaveStory 正确绑定
  const handleSaveStory = useCallback(async () => {
    // 首先检查是否登录
    if (!authService.isAuthenticated()) {
      // 如果未登录，弹出提示并跳转到登录页面
      const confirmLogin = window.confirm('您尚未登录，是否前往登录页面？');
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }

    try {
      // 确保至少有一页故事
      if (generatedStory.length === 0) {
        alert('请先生成故事');
        return;
      }

      // 调试：打印当前登录用户信息
      const userInfo = authService.getUserInfo();
      console.log('当前登录用户:', userInfo);

      // 检查 localStorage 中的用户信息
      const storedUserPhone = localStorage.getItem('userPhone');
      const storedToken = localStorage.getItem('token');
      console.log('存储的用户信息:', { 
        userPhone: storedUserPhone, 
        tokenExists: !!storedToken 
      });

      // 使用当前页面或第一页的数据
      const currentStoryPage = currentPage !== null ? generatedStory[currentPage] : generatedStory[0];

      // 从随机主题中获取主题，如果没有则使用默认值
      const themeFromRandomThemes = randomThemes.length > 0 
        ? randomThemes[currentThemeIndex]?.title 
        : '未知主题';

      const savedStory = await storyService.saveStory({
        title: currentStoryPage.title || generatedStory[0].title || '未命名绘本',
        theme: themeFromRandomThemes,
        pages: generatedStory.map(page => ({
          content: page.content,
          imageUrl: page.imageUrl || '',
          imagePrompt: page.imagePrompt,
          contentEn: page.contentEn,
          imagePromptEn: page.imagePromptEn
        }))
      });
      
      // 调试：打印保存成功的故事
      console.log('故事保存成功:', savedStory);

      alert('绘本保存成功！');
      navigate('/'); // 保存成功后跳转到首页
    } catch (error) {
      // 详细的错误日志
      console.error('保存故事时出错:', error);
      
      // 更具体的错误处理
      if (error instanceof Error) {
        if (error.message.includes('未登录')) {
          alert('登录状态已过期，请重新登录');
          navigate('/login');
        } else {
          alert(`保存失败：${error.message}`);
        }
      } else {
        alert('保存失败，请重试');
      }
    }
  }, [
    navigate, 
    generatedStory, 
    currentPage, 
    randomThemes, 
    currentThemeIndex
  ]);

  // 简化插画模式定义
  const illustrationModels = [
    {
      id: 'hand_drawn',
      name: '手绘',
      thumbnail: '/mod/hand_drawn.png',
      style: 'digital_illustration',
      substyle: 'hand_drawn',
      model: 'recraftv3'
    },
    {
      id: 'grain',
      name: '颗粒',
      thumbnail: '/mod/grain.png',
      style: 'digital_illustration',
      substyle: 'grain',
      model: 'recraftv3'
    },
    {
      id: 'kawaii',
      name: '可爱',
      thumbnail: '/mod/kawaii.png',
      style: 'digital_illustration',
      substyle: 'kawaii',
      model: 'recraftv2'
    },
    {
      id: 'watercolor', 
      name: '水彩', 
      thumbnail: '/mod/watercolor.png',
      style: 'digital_illustration',
      substyle: 'watercolor',
      model: 'recraftv2'
    },
    {
      id: 'pixel_art',
      name: '像素',
      thumbnail: '/mod/pixel_art.png',
      style: 'digital_illustration',
      substyle: 'pixel_art',
      model: 'recraftv2'
    },
    {
      id: 'natural_light',
      name: '自然光',
      thumbnail: '/mod/natural_light.png',
      style: 'realistic_image',
      substyle: 'natural_light',
      model: 'recraftv2'
    }
  ];

  // 画面比例选项
  const aspectRatios: AspectRatio[] = [
    { 
      id: '16:9',
      name: '16:9',
      value: '1707x1024', 
      width: 1707, 
      height: 1024,
      label: '16:9 (1707x1024)' 
    },
    { 
      id: '3:2',
      name: '3:2',
      value: '1536x1024', 
      width: 1536, 
      height: 1024,
      label: '3:2 (1536x1024)' 
    },
    { 
      id: '1:1',
      name: '1:1',
      value: '1024x1024', 
      width: 1024, 
      height: 1024,
      label: '1:1 (1024x1024)' 
    }
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
                style: illustrationSettings.style,
                substyle: illustrationSettings.substyle, // 使用选择的风格
                n: 1,
                size: illustrationSettings.aspectRatio,
                model: illustrationSettings.model,
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

  // 添加故事生成的加载状态
  const [generationStatus, setGenerationStatus] = useState<{
    stage: 'preparing' | 'generating_story' | 'parsing' | 'completed' | 'error';
    message: string;
    progress: number;
  }>({
    stage: 'preparing',
    message: '准备生成故事...',
    progress: 0
  });

  // 进度条组件
  const ProgressBar = ({ progress }: { progress: number }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  // 修改handleGenerate函数
  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGeneratedStory([]); // 清空现有故事
    
    // 初始状态
    setGenerationStatus({
      stage: 'preparing',
      message: '正在准备生成您的独特故事...',
      progress: 10
    });

    // 创建一个进度更新的函数
    const updateProgress = (stage: string, message: string, progress: number) => {
      setGenerationStatus(prev => ({
        stage,
        message,
        progress
      }));
    };

    try {
      // 模拟准备阶段
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateProgress('generating_story', '正在构思故事情节...', 30);

      // 模拟生成阶段
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateProgress('generating_story', '深入故事细节创作...', 50);

      // 发起API请求
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
            }`
          },
          {
            role: "user", 
            content: `主题：${theme}`
          }
        ],
        max_tokens: 3000,
        temperature: 1.5,
        response_format: { type: "json_object" },
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 40000
      });

      // 解析阶段
      updateProgress('parsing', '正在整理故事内容...', 70);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 解析响应
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

      // 完成阶段
      updateProgress('completed', '故事生成成功！', 100);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 设置故事并跳转到预览页
      setGeneratedStory(storyPages);
      setCurrentPage(0);
      setStep('story');

    } catch (error) {
      console.error('Story Generation Error:', error);
      updateProgress('error', '生成故事时出现错误，请重试', 0);
      
      // 显示错误提示
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
    if (isGeneratingImages || generatedStory.length === 0) return;

    try {
      setIsGeneratingImages(true);
      // 生成插画
      const pagesWithIllustrations = await generateIllustrations(generatedStory);
      setGeneratedStory(pagesWithIllustrations);
      setStep('illustration');
    } catch (error) {
      console.error('Error generating illustrations:', error);
      alert('生成插画时出现错误，请重试');
    } finally {
      setIsGeneratingImages(false);
    }
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

  // 修改generateRandomThemes函数，使用本地数据
  const generateRandomThemes = () => {
    if (isLoadingThemes) return;
    
    setIsLoadingThemes(true);
    try {
      const themes = getRandomInspirations(6);
      setRandomThemes(themes);
    } catch (error) {
      console.error('Error generating themes:', error);
      // 如果出错，使用默认主题
      setRandomThemes([
        { title: "勇敢的小兔子", category: "冒险" },
        { title: "神秘的森林", category: "奇幻" },
        { title: "海底冒险", category: "科幻" },
        { title: "太空旅行", category: "科幻" },
        { title: "友谊的魔法", category: "生活" },
        { title: "梦想花园", category: "自然" }
      ]);
    } finally {
      setIsLoadingThemes(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 生成过程中的全屏加载UI */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center space-y-6">
                {/* 进度条 */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${generationStatus.progress}%`,
                    }}
                  />
                </div>

                {/* 状态图标 */}
                <div className="relative w-24 h-24 mx-auto">
                  {generationStatus.stage === 'preparing' && (
                    <div className="animate-bounce">
                      <Sparkles className="w-24 h-24 text-yellow-500" />
                    </div>
                  )}
                  {generationStatus.stage === 'generating_story' && (
                    <div className="animate-spin">
                      <Loader2 className="w-24 h-24 text-blue-500" />
                    </div>
                  )}
                  {generationStatus.stage === 'parsing' && (
                    <div className="animate-pulse">
                      <BookOpen className="w-24 h-24 text-green-500" />
                    </div>
                  )}
                  {generationStatus.stage === 'completed' && (
                    <div className="animate-bounce">
                      <div className="text-6xl">✨</div>
                    </div>
                  )}
                </div>

                {/* 状态文本 */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {generationStatus.message}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {generationStatus.stage === 'preparing' && '正在准备创作您的故事...'}
                    {generationStatus.stage === 'generating_story' && '故事正在编织中，请稍候...'}
                    {generationStatus.stage === 'parsing' && '即将完成，马上为您呈现...'}
                    {generationStatus.stage === 'completed' && '创作完成！'}
                  </p>
                </div>

                {/* 提示文本 */}
                <p className="text-xs text-gray-400 italic">
                  故事生成可能需要约10秒钟，请耐心等待
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'theme' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">选择故事主题</h1>
            </div>

            {/* 添加自定义主题输入框 */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="space-y-4">
                <div>

                  <div className="flex gap-4">
                    <input
                      type="text"
                      id="customTheme"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="输入您的创意主题..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={!theme.trim() || isGenerating}
                      className={`px-6 py-2 rounded-lg flex items-center ${
                        !theme.trim() || isGenerating
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          生成中
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          开始创作
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {randomThemes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setTheme(item.title)}
                  className="p-6 rounded-lg shadow-md transition-all duration-200 bg-white hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </span>
                    <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={generateRandomThemes}
                disabled={isLoadingThemes}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isLoadingThemes ? '加载中...' : '换一批主题'}
              </button>
            </div>
          </div>
        )}

        {step === 'story' && (
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
        )}

        {step === 'illustration-settings' && (
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
                    onClick={() => {
                      setIllustrationSettings(prev => ({
                        ...prev,
                        model: model.model,
                        style: model.style,
                        substyle: model.substyle,
                        selectedId: model.id  // 添加选中的id
                      }));
                    }}
                    className={`
                      relative p-4 rounded-xl overflow-hidden
                      border-2 transition-all duration-300
                      ${illustrationSettings.selectedId === model.id
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
                    {illustrationSettings.selectedId === model.id && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">画面比例</h3>
              <div className="grid grid-cols-3 gap-4">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => {
                      handleUpdateIllustrationSettings('aspectRatio', ratio.value);
                      handleUpdateIllustrationSettings('aspectRatioId', ratio.id);
                    }}
                    className={`
                      relative p-4 rounded-xl overflow-hidden
                      border-2 transition-all duration-300
                      ${illustrationSettings.aspectRatioId === ratio.id 
                        ? 'border-indigo-600 shadow-lg' 
                        : 'border-gray-200 hover:border-indigo-300'}
                    `}
                  >
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 text-xl">{ratio.id}</h4>
                    </div>
                    {illustrationSettings.aspectRatioId === ratio.id && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
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
        )}

        {step === 'illustration' && (
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
                    <button
                      onClick={handleSaveStory}
                      className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>保存绘本</span>
                    </button>
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
    </div>
  );
}