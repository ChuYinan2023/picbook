// src/services/recraftService.ts
import axios from 'axios';

const RECRAFT_API_BASE = 'https://external.api.recraft.ai/v1';

export const recraftService = {
  async generateImage(prompt: string) {
    try {
      const response = await axios.post(
        `${RECRAFT_API_BASE}/images/generations`,
        {
          prompt,
          style: 'digital_illustration',  // 或其他风格
          n: 1,  // 生成图片数量
          response_format: 'url'  // 或 'b64_json'
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