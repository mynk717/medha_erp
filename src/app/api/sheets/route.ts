import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { KVStore } from '@/lib/kvStore';

// GET - Get user's sheets
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kv = KVStore.getInstance();
    const userId = (session.user as any).userId;
    
    const sheets = await kv.getUserSheets(userId);
    const activeSheetId = await kv.getActiveSheet(userId);

    return NextResponse.json({ 
      sheets,
      activeSheetId 
    });
  } catch (error) {
    console.error('Error fetching sheets:', error);
    return NextResponse.json({ error: 'Failed to fetch sheets' }, { status: 500 });
  }
}

// POST - Add new sheet
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, tag } = await req.json();
    
    if (!spreadsheetId || !tag) {
      return NextResponse.json({ error: 'Missing spreadsheetId or tag' }, { status: 400 });
    }

    const kv = KVStore.getInstance();
    const userId = (session.user as any).userId;
    
    await kv.addUserSheet(userId, spreadsheetId, tag);
    await kv.setActiveSheet(userId, spreadsheetId);

    return NextResponse.json({ 
      success: true,
      message: 'Sheet added successfully' 
    });
  } catch (error) {
    console.error('Error adding sheet:', error);
    return NextResponse.json({ error: 'Failed to add sheet' }, { status: 500 });
  }
}

// PUT - Update sheet tag or set active
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, tag, setActive } = await req.json();
    
    const kv = KVStore.getInstance();
    const userId = (session.user as any).userId;
    
    if (setActive) {
      await kv.setActiveSheet(userId, spreadsheetId);
    }
    
    if (tag) {
      await kv.addUserSheet(userId, spreadsheetId, tag);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sheet updated successfully' 
    });
  } catch (error) {
    console.error('Error updating sheet:', error);
    return NextResponse.json({ error: 'Failed to update sheet' }, { status: 500 });
  }
}

// DELETE - Remove sheet
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('id');
    
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Missing spreadsheetId' }, { status: 400 });
    }

    const kv = KVStore.getInstance();
    const userId = (session.user as any).userId;
    
    await kv.removeUserSheet(userId, spreadsheetId);

    return NextResponse.json({ 
      success: true,
      message: 'Sheet removed successfully' 
    });
  } catch (error) {
    console.error('Error removing sheet:', error);
    return NextResponse.json({ error: 'Failed to remove sheet' }, { status: 500 });
  }
}
