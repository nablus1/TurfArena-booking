// app/api/payments/test-token/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  console.log('Testing M-Pesa Credentials...');
  console.log('Consumer Key (first 10 chars):', consumerKey?.substring(0, 10));
  console.log('Consumer Secret (first 10 chars):', consumerSecret?.substring(0, 10));

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json({
      success: false,
      error: 'Consumer Key or Secret not found in environment variables',
    }, { status: 400 });
  }

  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    console.log('Attempting to get access token...');
    
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    console.log('✅ Access token generated successfully!');

    return NextResponse.json({
      success: true,
      message: '✅ Credentials are correct!',
      tokenPreview: response.data.access_token.substring(0, 20) + '...',
      expiresIn: response.data.expires_in + ' seconds',
    });

  } catch (error: any) {
    console.error('❌ Token generation failed');
    console.error('Error:', error.response?.data || error.message);

    return NextResponse.json({
      success: false,
      error: 'Invalid credentials',
      details: error.response?.data || error.message,
      hint: 'Check your MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env.local',
    }, { status: 401 });
  }
}