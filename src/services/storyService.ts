export interface Story {
  id: string;
  title: string;
  theme: string;
  content: string;
  imagePrompt: string;
  imageUrl: string;
  createdAt: string;
  userId: string;
  titleEn?: string;
  contentEn?: string;
  imagePromptEn?: string;
}

export const storyService = {
  // 保存绘本
  saveStory: async (story: Omit<Story, 'id' | 'createdAt' | 'userId'>) => {
    const userId = localStorage.getItem('userPhone');
    if (!userId) {
      throw new Error('用户未登录');
    }

    // 创建新的故事对象
    const newStory: Story = {
      ...story,
      id: `story_${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId
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