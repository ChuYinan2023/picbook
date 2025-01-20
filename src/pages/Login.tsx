import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    try {
      setLoading(true);
      await authService.sendCode(phone);
      
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      alert('发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await authService.verifyLogin(phone, code);
      
      // 登录成功后直接跳转到首页
      navigate('/');
    } catch (error) {
      alert('登录失败，请检查验证码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          手机号登录
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              手机号
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                id="phone"
                type="tel"
                required
                className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              验证码
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                id="code"
                type="text"
                required
                className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || loading}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
              </button>
            </div>
            {/* 在开发环境显示验证码提示 */}
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-1 text-sm text-gray-500">
                测试验证码：1234
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;