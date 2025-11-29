// 点赞留言API端点
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 解析请求体
    const formData = await request.json();
    const { messageId } = formData;
    
    // 验证输入
    if (!messageId) {
      return new Response(JSON.stringify({ success: false, message: '留言ID不能为空' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // 获取留言数据
    const messageDataStr = await env.WEDDING_USER_DATA.get(messageId);
    if (!messageDataStr) {
      return new Response(JSON.stringify({ success: false, message: '留言不存在' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    // 更新点赞数
    const messageData = JSON.parse(messageDataStr);
    messageData.likes = (messageData.likes || 0) + 1;
    
    // 保存更新后的留言数据
    await env.WEDDING_USER_DATA.put(messageId, JSON.stringify(messageData));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: '点赞成功！',
      likes: messageData.likes
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('点赞失败：', error);
    return new Response(JSON.stringify({ success: false, message: '点赞失败，请稍后重试' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}