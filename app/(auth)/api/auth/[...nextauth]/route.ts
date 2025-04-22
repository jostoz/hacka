import { auth, signIn } from '@/app/(auth)/auth';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  return NextResponse.json(session);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await signIn('credentials', body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
