import axios from 'axios';

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      passkey: process.env.MPESA_PASSKEY!,
      shortcode: process.env.MPESA_SHORTCODE!,
      callbackUrl: process.env.MPESA_CALLBACK_URL!,
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };

    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString('base64');

    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('M-Pesa token error:', error);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    const password = Buffer.from(
      `${this.config.shortcode}${this.config.passkey}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
  }

  private formatPhoneNumber(phone: string): string {
    phone = phone.replace(/[\s\-+]/g, '');

    if (phone.startsWith('0')) {
      return '254' + phone.slice(1);
    }

    if (phone.startsWith('254')) {
      return phone;
    }

    if (phone.startsWith('7') || phone.startsWith('1')) {
      return '254' + phone;
    }

    return phone;
  }

  async stkPush(request: STKPushRequest) {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();
    const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

    const payload = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(request.amount),
      PartyA: phoneNumber,
      PartyB: this.config.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.config.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: {
          merchantRequestId: response.data.MerchantRequestID,
          checkoutRequestId: response.data.CheckoutRequestID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
          customerMessage: response.data.CustomerMessage,
        },
      };
    } catch (error: any) {
      console.error('M-Pesa STK Push error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Payment initiation failed',
      };
    }
  }

  async queryTransaction(checkoutRequestId: string) {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    const payload = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('M-Pesa query error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Query failed',
      };
    }
  }
}

export const mpesaService = new MpesaService();