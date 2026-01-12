import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { KVStore } from '@/lib/kvStore';

// GET - Get user's business settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kv = KVStore.getInstance();
    const userId = (session.user as any).userId;
    
    const settings = await kv.getBusinessSettings(userId);

    return NextResponse.json({ 
      settings: settings || {
        businessName: '',
        gstNumber: '',
        address: '',
        phone: '',
        email: session.user.email || '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
        upiId: ''
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Save user's business settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await req.json();
    
    const kv = KVStore.getInstance();
    const userId = (session.user as any).userId;
    
    await kv.saveBusinessSettings(userId, settings);

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
