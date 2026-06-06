// app/api/payments/stk-push/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Generate M-Pesa access token
async function generateAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Access token error:', error);
    throw new Error('Failed to generate access token');
  }
}

// Generate password for STK Push
function generatePassword(businessShortCode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');
}

// Format phone number to 254XXXXXXXXX
function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or plus signs
  let cleaned = phone.replace(/[\s\-\+]/g, '');
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // If starts with 254, keep as is
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // If starts with +254, remove the +
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // Otherwise assume it's a local number without prefix
  return '254' + cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, phoneNumber, accountReference, transactionDesc } = await req.json();

    // Validate required fields
    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { error: 'Amount and phone number are required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!businessShortCode || !passkey || !callbackUrl) {
      console.error('Missing M-Pesa environment variables');
      return NextResponse.json(
        { error: 'M-Pesa configuration error' },
        { status: 500 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Validate phone number format (should be 254XXXXXXXXX and 12 digits)
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Should be 254XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Generate timestamp (YYYYMMDDHHmmss)
    const timestamp = new Date().toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14);

    // Generate password
    const password = generatePassword(businessShortCode, passkey, timestamp);

    // Get access token
    const accessToken = await generateAccessToken();

    // Prepare STK Push payload
    const stkPushPayload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(Number(amount)), // Ensure it's an integer
      PartyA: formattedPhone,
      PartyB: businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || 'TurfBooking',
      TransactionDesc: transactionDesc || 'Turf Booking Payment',
    };

    console.log('STK Push Request:', {
      ...stkPushPayload,
      Password: '***HIDDEN***',
    });

    // Make STK Push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('STK Push Response:', response.data);

    return NextResponse.json({
      success: true,
      data: response.data,
    });

  } catch (error: any) {
    // Log detailed error information
    console.error('==================== STK PUSH ERROR ====================');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Request Config:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
    });
    console.error('======================================================');

    // Return detailed error to help with debugging
    return NextResponse.json(
      {
        error: 'Payment initiation failed',
        message: error.message,
        mpesaError: error.response?.data,
        statusCode: error.response?.status,
        // Include helpful debugging info
        debug: {
          timestamp: new Date().toISOString(),
          errorCode: error.code,
        }
      },
      { status: error.response?.status || 500 }
    );
  }
}