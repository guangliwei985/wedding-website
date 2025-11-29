// 主JavaScript文件
import { isLoggedIn, getCurrentUser, logout } from './auth.js';

console.log('欢迎来到我们的婚礼网站！');

// 更新导航栏
function updateNavbar() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  
  const loginLink = nav.querySelector('a[href*="login.html"]');
  const registerLink = nav.querySelector('a[href*="register.html"]');
  
  if (isLoggedIn()) {
    // 用户已登录，显示用户名和登出按钮
    const user = getCurrentUser();
    
    if (loginLink) {
      loginLink.textContent = `欢迎，${user.username}`;
      loginLink.href = '#';
      loginLink.style.pointerEvents = 'none';
    }
    
    if (registerLink) {
      registerLink.textContent = '登出';
      registerLink.href = '#';
      registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
        window.location.reload();
      });
    }
  }
}

// 页面加载完成后更新导航栏
document.addEventListener('DOMContentLoaded', function() {
  updateNavbar();
});