
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('token', '', { path: '/', expires: new Date(0) });
  response.cookies.set('role', '', { path: '/', expires: new Date(0) });
  return response;
}
