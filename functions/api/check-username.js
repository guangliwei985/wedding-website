// 检查用户名是否可用的API端点
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // 解析查询参数
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    
    if (!username) {
      return new Response(JSON.stringify({ success: false, message: '用户名不能为空' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // 检查用户名是否已存在
    const existingUser = await env.WEDDING_USER_DATA.get(`user:${username}`);
    
    return new Response(JSON.stringify({
      success: true,
      available: !existingUser
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('检查用户名错误：', error);
    return new Response(JSON.stringify({ success: false, message: '检查失败，请稍后重试' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}