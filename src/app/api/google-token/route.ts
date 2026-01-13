import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { KVStore } from '@/lib/kvStore';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kv = KVStore.getInstance(); // ✅ FIXED: was kVStore
    const userId = (session.user as any).userId;
    
    const tokenData = await kv.getGoogleToken(userId); // ✅ FIXED: was kVStore
    
    if (!tokenData || Date.now() > tokenData.expiresAt) {
      return NextResponse.json({ token: null });
    }

    return NextResponse.json({ token: tokenData.token });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, expiresAt } = await req.json();
    
    const kv = KVStore.getInstance(); // ✅ FIXED
    const userId = (session.user as any).userId;
    
    await kv.saveGoogleToken(userId, { token, expiresAt }); // ✅ FIXED

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving token:', error);
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }
}
