// 登录API端点
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 解析请求体
    const formData = await request.json();
    const { identifier, password } = formData;
    
    // 验证输入
    if (!identifier || !password) {
      return new Response(JSON.stringify({ success: false, message: '用户名/手机号和密码不能为空' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // 确定是用户名还是手机号
    let username;
    if (identifier.match(/^1[3-9]\d{9}$/)) {
      // 手机号登录
      username = await env.WEDDING_USER_DATA.get(`phone:${identifier}`);
      if (!username) {
        return new Response(JSON.stringify({ success: false, message: '手机号未注册' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401
        });
      }
    } else {
      // 用户名登录
      username = identifier;
    }
    
    // 获取用户数据
    const userDataStr = await env.WEDDING_USER_DATA.get(`user:${username}`);
    if (!userDataStr) {
      return new Response(JSON.stringify({ success: false, message: '用户名不存在' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    const userData = JSON.parse(userDataStr);
    
    // 验证密码
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashedPassword !== userData.password) {
      return new Response(JSON.stringify({ success: false, message: '密码错误' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    // 更新最后登录时间
    userData.lastLogin = new Date().toISOString();
    await env.WEDDING_USER_DATA.put(`user:${username}`, JSON.stringify(userData));
    
    // 生成简单的会话令牌（使用用户名加密）
    const sessionToken = btoa(`${username}:${Date.now()}`);
    
    // 返回成功响应
    return new Response(JSON.stringify({ 
      success: true, 
      message: '登录成功！',
      username: userData.username,
      token: sessionToken
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('登录错误：', error);
    return new Response(JSON.stringify({ success: false, message: '登录失败，请稍后重试' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}