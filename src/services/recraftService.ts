// src/services/recraftService.ts
import axios from 'axios';

const MOCK_IMAGES = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5'
];

const RECRAFT_API_BASE = 'https://external.api.recraft.ai/v1';

// 通过环境变量控制是否使用模拟模式
// 使用 import.meta.env.VITE_MOCK_RECRAFT_API 可能不会正确读取
const IS_DEBUG_MODE = process.env.VITE_MOCK_RECRAFT_API === 'true' || 
                      import.meta.env.VITE_MOCK_RECRAFT_API === 'true';

export const recraftService = {
  async generateImage(prompt: string) {
    console.log(`[DEBUG] IS_DEBUG_MODE: ${IS_DEBUG_MODE}`); // 添加日志帮助诊断

    if (IS_DEBUG_MODE) {
      // 调试模式：返回模拟图片
      console.log(`[MOCK] Generating image for prompt: ${prompt}`);
      const randomIndex = Math.floor(Math.random() * MOCK_IMAGES.length);
      return MOCK_IMAGES[randomIndex];
    }

    // 生产模式：调用真实 API
    try {
      const response = await axios.post(
        `${RECRAFT_API_BASE}/images/generations`,
        {
          prompt,
          style: 'digital_illustration',
          n: 1,
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_RECRAFT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  },

  async removeBackground(imageFile: File) {
    if (IS_DEBUG_MODE) {
      // 调试模式：返回原图
      console.log(`[MOCK] Removing background from image: ${imageFile.name}`);
      return {
        image_url: URL.createObjectURL(imageFile)
      };
    }

    // 生产模式：调用真实 API
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(
        `${RECRAFT_API_BASE}/images/remove-background`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_RECRAFT_API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  }
};