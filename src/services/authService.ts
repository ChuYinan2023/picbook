interface LoginResponse {
  token: string;
  user: {
    phone: string;
  };
}

const MOCK_CODE = '1234'; // 模拟验证码

export const authService = {
  sendCode: async (phone: string): Promise<void> => {
    // 模拟发送验证码的延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`模拟发送验证码到 ${phone}，验证码是：${MOCK_CODE}`);
    return Promise.resolve();
  },

  verifyLogin: async (phone: string, code: string): Promise<LoginResponse> => {
    // 模拟验证过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (code !== MOCK_CODE) {
      throw new Error('验证码错误');
    }

    // 模拟成功登录返回
    const response = {
      token: `mock_token_${phone}_${Date.now()}`,
      user: {
        phone
      }
    };

    // 保存用户信息 - 确保同时设置 token 和 userPhone
    localStorage.setItem('token', response.token);
    localStorage.setItem('userPhone', phone);

    // 打印日志以便调试
    console.log('登录成功，token已保存:', response.token);

    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userPhone');
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const userPhone = localStorage.getItem('userPhone');
    
    // 同时检查 token 和 userPhone
    const isValid = !!token && !!userPhone;
    
    // 调试日志
    if (!isValid) {
      console.warn('未检测到有效的登录状态');
    }
    
    return isValid;
  },

  getUserInfo: () => {
    return {
      phone: localStorage.getItem('userPhone')
    };
  }
};