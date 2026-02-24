import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY ? '✅ Set' : '❌ Missing',
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET ? '✅ Set' : '❌ Missing',
    MPESA_BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE || '❌ Missing',
    MPESA_PASSKEY: process.env.MPESA_PASSKEY ? '✅ Set' : '❌ Missing',
    MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL || '❌ Missing',
  });
}