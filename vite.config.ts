import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      // 确保环境变量被正确定义
      '__DEV__': mode === 'development',
      'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(env.VITE_DEEPSEEK_API_KEY || '')
    },
    // 确保客户端可以访问环境变量
    envPrefix: ['VITE_']
  }
})