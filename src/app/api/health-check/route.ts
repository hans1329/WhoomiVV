import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Simple health check to confirm API server is running
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: String(error)
    }, { status: 500 });
  }
} 