// 留言板API端点

// 获取留言列表
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 获取所有留言ID
    const messageKeys = await env.WEDDING_USER_DATA.list({
      prefix: 'message:'
    });
    
    // 获取每条留言的内容
    const messages = [];
    for (const key of messageKeys.keys) {
      const messageData = await env.WEDDING_USER_DATA.get(key.name);
      if (messageData) {
        messages.push(JSON.parse(messageData));
      }
    }
    
    // 按创建时间排序（最新的在前面）
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return new Response(JSON.stringify({ 
      success: true, 
      messages: messages
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('获取留言列表失败：', error);
    return new Response(JSON.stringify({ success: false, message: '获取留言失败，请稍后重试' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// 创建新留言
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 解析请求体
    const formData = await request.json();
    const { message, username, token } = formData;
    
    // 验证输入
    if (!message || !username || !token) {
      return new Response(JSON.stringify({ success: false, message: '留言内容、用户名和令牌不能为空' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // 简单验证令牌
    try {
      const decoded = atob(token);
      const [decodedUsername] = decoded.split(':');
      if (decodedUsername !== username) {
        return new Response(JSON.stringify({ success: false, message: '无效的令牌' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: '无效的令牌' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    // 生成唯一留言ID
    const messageId = `message:${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // 准备留言数据
    const messageData = {
      id: messageId,
      username: username,
      content: message,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    // 存储留言数据
    await env.WEDDING_USER_DATA.put(messageId, JSON.stringify(messageData));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: '留言成功！',
      newMessage: messageData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('创建留言失败：', error);
    return new Response(JSON.stringify({ success: false, message: '留言失败，请稍后重试' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}