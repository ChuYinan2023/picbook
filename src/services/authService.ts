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

    // 保存用户信息
    localStorage.setItem('token', response.token);
    localStorage.setItem('userPhone', phone);

    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userPhone');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getUserInfo: () => {
    return {
      phone: localStorage.getItem('userPhone')
    };
  }
};