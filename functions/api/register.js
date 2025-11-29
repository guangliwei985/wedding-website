// 注册API端点
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 解析请求体
    const formData = await request.json();
    const { username, password, phone } = formData;
    
    // 验证输入
    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, message: '用户名和密码不能为空' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // 检查用户名是否已存在
    const existingUser = await env.WEDDING_USER_DATA.get(`user:${username}`);
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, message: '用户名已被使用' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // 检查手机号是否已被使用（如果提供了手机号）
    if (phone) {
      const existingPhone = await env.WEDDING_USER_DATA.get(`phone:${phone}`);
      if (existingPhone) {
        return new Response(JSON.stringify({ success: false, message: '手机号已被绑定' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
    }
    
    // 密码加密（使用内置的Web Crypto API）
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 准备用户数据
    const userData = {
      username,
      password: hashedPassword,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // 存储用户数据
    await env.WEDDING_USER_DATA.put(`user:${username}`, JSON.stringify(userData));
    
    // 如果提供了手机号，创建手机号到用户名的映射
    if (phone) {
      await env.WEDDING_USER_DATA.put(`phone:${phone}`, username);
    }
    
    // 返回成功响应
    return new Response(JSON.stringify({ success: true, message: '注册成功！' }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('注册错误：', error);
    return new Response(JSON.stringify({ success: false, message: '注册失败，请稍后重试' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}