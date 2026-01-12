import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    // Test write
    await redis.set('test-connection', {
      message: 'Redis is working!',
      timestamp: new Date().toISOString()
    });
    
    // Test read
    const value = await redis.get('test-connection');
    
    return NextResponse.json({ 
      success: true,
      data: value,
      env: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
