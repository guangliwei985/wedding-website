// 认证工具函数

// 检查用户是否已登录
export function isLoggedIn() {
  return localStorage.getItem('wedding_token') !== null;
}

// 获取当前登录用户
export function getCurrentUser() {
  return {
    username: localStorage.getItem('wedding_username'),
    token: localStorage.getItem('wedding_token')
  };
}

// 登出用户
export function logout() {
  localStorage.removeItem('wedding_username');
  localStorage.removeItem('wedding_token');
}