// 预设名字库
const namePool = [
  "星辰", "月光", "花瓣", "梦境", "心跳", 
  "誓言", "永恒", "温柔", "眷恋", "浪漫",
  "幸福", "甜蜜", "温馨", "美好", "珍贵",
  "珍爱", "深情", "挚爱", "依恋", "相守"
];

// 检查用户名是否可用
async function checkUsernameAvailability(username) {
  try {
    const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('检查用户名失败：', error);
    return false;
  }
}

// 生成随机用户名（确保可用）
async function generateRandomUsername() {
  let username;
  let isAvailable = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isAvailable && attempts < maxAttempts) {
    const randomIndex = Math.floor(Math.random() * namePool.length);
    username = namePool[randomIndex];
    isAvailable = await checkUsernameAvailability(username);
    attempts++;
  }
  
  // 如果多次尝试后仍未找到可用用户名，添加随机数字
  if (!isAvailable) {
    const randomNumber = Math.floor(Math.random() * 1000);
    username = `${namePool[Math.floor(Math.random() * namePool.length)]}${randomNumber}`;
  }
  
  return username;
}

// 初始化用户名
document.addEventListener('DOMContentLoaded', async function() {
  const usernameInput = document.getElementById('username');
  const refreshButton = document.getElementById('refreshUsername');
  const registerForm = document.getElementById('registerForm');
  
  // 初始生成用户名
  usernameInput.value = await generateRandomUsername();
  
  // 点击刷新按钮生成新用户名
  refreshButton.addEventListener('click', async function() {
    usernameInput.value = await generateRandomUsername();
  });
  
  // 表单提交处理
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    
    try {
      // 调用注册API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, phone })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('注册成功！请登录');
        // 跳转到登录页面
        window.location.href = '../pages/login.html';
      } else {
        alert('注册失败：' + data.message);
      }
    } catch (error) {
      console.error('注册请求失败：', error);
      alert('注册失败，请稍后重试');
    }
  });
});