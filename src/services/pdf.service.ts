// src/services/pdf.service.ts
import QRCode from 'qrcode';

class PDFService {
  async generateTicket(bookingData: any) {
    try {
      // Generate QR code
      const qrCode = await QRCode.toDataURL(bookingData.bookingReference);

      // For now, return basic ticket data
      // implement actual PDF generation later
      return {
        ticketUrl: `/tickets/${bookingData.bookingReference}`,
        qrCode,
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate ticket');
    }
  }
}

export const pdfService = new PDFService();
