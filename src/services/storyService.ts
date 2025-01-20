export interface StoryPage {
  id: string;
  pageNumber: number;
  content: string;
  imageUrl: string;
  contentEn?: string;
}

export interface Story {
  id: string;
  title: string;
  theme: string;
  pages: StoryPage[];
  createdAt: string;
  userId: string;
  titleEn?: string;
  imagePrompt?: string;
  imageUrl?: string;
  content?: string;
  imagePromptEn?: string;
  contentEn?: string;
}

export const storyService = {
  // 保存多页绘本
  saveStory: async (story: Omit<Story, 'id' | 'createdAt' | 'userId' | 'pages'> & { pages?: StoryPage[] }) => {
    const userId = localStorage.getItem('userPhone');
    if (!userId) {
      throw new Error('用户未登录');
    }

    // 如果没有传入页面，从单页数据创建默认页面
    const storyPages: StoryPage[] = story.pages && story.pages.length > 0 
      ? story.pages 
      : [{
          id: `page_${Date.now()}`,
          pageNumber: 1,
          content: story.content || story.theme,
          imageUrl: story.imageUrl || '',
          imagePrompt: story.imagePrompt || '',
          contentEn: story.contentEn,
          imagePromptEn: story.imagePromptEn
        }];

    // 创建新的故事对象
    const newStory: Story = {
      id: `story_${Date.now()}`,
      title: story.title,
      theme: story.theme,
      pages: storyPages.map((page, index) => ({
        ...page,
        id: page.id || `page_${Date.now()}_${index}`,
        pageNumber: index + 1
      })),
      createdAt: new Date().toISOString(),
      userId,
      titleEn: story.titleEn,
      imagePrompt: story.imagePrompt,
      imageUrl: story.imageUrl,
      content: story.content,
      imagePromptEn: story.imagePromptEn,
      contentEn: story.contentEn
    };

    // 获取现有的故事列表
    const existingStories = JSON.parse(localStorage.getItem('stories') || '[]');
    
    // 添加新故事
    const updatedStories = [...existingStories, newStory];
    
    // 保存到 localStorage
    localStorage.setItem('stories', JSON.stringify(updatedStories));

    return newStory;
  },

  // 获取用户的所有绘本
  getUserStories: (): Story[] => {
    const userId = localStorage.getItem('userPhone');
    if (!userId) {
      return [];
    }

    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    return stories.filter((story: Story) => story.userId === userId);
  },

  // 获取单个绘本详情
  getStory: (storyId: string): Story | null => {
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    return stories.find((story: Story) => story.id === storyId) || null;
  }
};