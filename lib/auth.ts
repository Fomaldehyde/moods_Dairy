import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// 从请求中获取用户ID
export async function getUserIdFromAuth(request: Request): Promise<string | null> {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return null;
    }
    
    // 验证JWT
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    console.error('验证令牌失败:', error);
    return null;
  }
} 