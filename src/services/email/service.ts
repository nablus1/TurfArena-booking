interface EmailData {
  to: string;
  userName: string;
  bookingReference: string;
  ticketUrl: string;
  pdfBuffer?: Buffer;
}

export const emailService = {
  async sendTicket(data: EmailData) {
    // If using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'bookings@jujaturf.co.ke',
          to: data.to,
          subject: `Booking Confirmed - ${data.bookingReference}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .info-box { background: white; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Booking Confirmed!</h1>
                </div>
                <div class="content">
                  <h2>Hello ${data.userName}!</h2>
                  <p>Your turf booking has been confirmed. We're excited to see you on the pitch!</p>
                  
                  <div class="info-box">
                    <h3>Booking Reference</h3>
                    <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 10px 0;">
                      ${data.bookingReference}
                    </p>
                  </div>

                  <p><strong>Important:</strong> Please present your ticket (attached) at the entrance. You can also download it using the link below.</p>

                  <a href="${data.ticketUrl}" class="button">Download Ticket</a>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <h3>What to Bring:</h3>
                    <ul>
                      <li>Your ticket (printed or on phone)</li>
                      <li>Valid ID</li>
                      <li>Sports gear</li>
                    </ul>
                  </div>

                  <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    For any inquiries, contact us at:<br>
                    📞 +254 712 345 678<br>
                    📧 bookings@jujaturf.co.ke
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments: data.pdfBuffer ? [
            {
              filename: `ticket-${data.bookingReference}.pdf`,
              content: data.pdfBuffer,
            }
          ] : undefined,
        });

        console.log('✓ Email sent to:', data.to);
        return { success: true };
      } catch (error) {
        console.error('Email error:', error);
        return { success: false, error };
      }
    }

    // Fallback: Log to console
    console.log('📧 Email would be sent to:', data.to);
    return { success: true };
  },

  async sendBookingReminder(data: {
    to: string;
    userName: string;
    bookingReference: string;
    date: string;
    time: string;
  }) {
    console.log('📧 Reminder email:', data);
    // Implement reminder email
  },

  async sendCancellationEmail(data: {
    to: string;
    userName: string;
    bookingReference: string;
  }) {
    console.log('📧 Cancellation email:', data);
    // Implement cancellation email
  },
};

// src/services/sms.service.ts
export const smsService = {
  async sendBookingConfirmation(data: {
    phone: string;
    bookingReference: string;
    date: string;
    time: string;
  }) {
    if (!process.env.AFRICASTALKING_API_KEY) {
      console.log('📱 SMS would be sent:', data);
      return { success: true };
    }

    try {
      // Africa's Talking integration
      const africastalking = require('africastalking')({
        apiKey: process.env.AFRICASTALKING_API_KEY,
        username: process.env.AFRICASTALKING_USERNAME,
      });

      const sms = africastalking.SMS;

      const message = `Juja Turf: Your booking ${data.bookingReference} is confirmed for ${data.date} at ${data.time}. Show this SMS at entry. Call 0712345678 for support.`;

      const result = await sms.send({
        to: [data.phone],
        message,
        from: process.env.SMS_FROM,
      });

      console.log('✓ SMS sent:', result);
      return { success: true, result };
    } catch (error) {
      console.error('SMS error:', error);
      return { success: false, error };
    }
  },

  async sendPaymentReminder(phone: string, bookingReference: string) {
    const message = `Juja Turf: Complete payment for booking ${bookingReference}. Pay via M-Pesa to confirm your slot.`;
    console.log('📱 Payment reminder SMS:', message);
  },
};