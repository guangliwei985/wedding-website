// 留言板页面JavaScript
import { isLoggedIn, getCurrentUser } from './auth.js';

// 渲染留言列表
function renderMessages(messages) {
  const messagesContainer = document.getElementById('messagesContainer');
  messagesContainer.innerHTML = '';
  
  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item';
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-username">${message.username}</span>
        <span class="message-time">${new Date(message.createdAt).toLocaleString()}</span>
      </div>
      <div class="message-content">${message.content}</div>
      <div class="message-actions">
        <button class="btn-like" data-message-id="${message.id}">
          ❤️ 点赞 (${message.likes || 0})
        </button>
      </div>
    `;
    messagesContainer.appendChild(messageElement);
  });
  
  // 添加点赞事件监听器
  addLikeEventListeners();
}

// 添加点赞事件监听器
function addLikeEventListeners() {
  const likeButtons = document.querySelectorAll('.btn-like');
  likeButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const messageId = this.getAttribute('data-message-id');
      await likeMessage(messageId, this);
    });
  });
}

// 获取留言列表
async function fetchMessages() {
  try {
    const response = await fetch('/api/messages');
    const data = await response.json();
    if (data.success) {
      renderMessages(data.messages);
    } else {
      console.error('获取留言失败：', data.message);
    }
  } catch (error) {
    console.error('获取留言失败：', error);
  }
}

// 提交留言
async function submitMessage() {
  const messageInput = document.getElementById('message');
  const message = messageInput.value.trim();
  
  if (!message) {
    alert('请输入留言内容');
    return;
  }
  
  if (!isLoggedIn()) {
    alert('请先登录');
    window.location.href = '../pages/login.html';
    return;
  }
  
  const user = getCurrentUser();
  
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        username: user.username,
        token: user.token
      })
    });
    
    const data = await response.json();
    if (data.success) {
      alert('留言成功！');
      messageInput.value = '';
      fetchMessages(); // 重新获取留言列表
    } else {
      alert('留言失败：' + data.message);
    }
  } catch (error) {
    console.error('提交留言失败：', error);
    alert('留言失败，请稍后重试');
  }
}

// 点赞留言
async function likeMessage(messageId, buttonElement) {
  try {
    const response = await fetch('/api/like-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messageId })
    });
    
    const data = await response.json();
    if (data.success) {
      // 更新按钮显示的点赞数
      buttonElement.innerHTML = `❤️ 点赞 (${data.likes})`;
    } else {
      console.error('点赞失败：', data.message);
    }
  } catch (error) {
    console.error('点赞失败：', error);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  const guestbookForm = document.getElementById('guestbookForm');
  
  // 加载留言列表
  fetchMessages();
  
  // 表单提交处理
  guestbookForm.addEventListener('submit', function(e) {
    e.preventDefault();
    submitMessage();
  });
});