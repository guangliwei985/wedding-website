// 登录页面JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  // 表单提交处理
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('identifier').value;
    const password = document.getElementById('password').value;
    
    try {
      // 调用登录API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 存储登录信息到localStorage
        localStorage.setItem('wedding_username', data.username);
        localStorage.setItem('wedding_token', data.token);
        
        alert('登录成功！');
        // 跳转到首页
        window.location.href = '../index.html';
      } else {
        alert('登录失败：' + data.message);
      }
    } catch (error) {
      console.error('登录请求失败：', error);
      alert('登录失败，请稍后重试');
    }
  });
});