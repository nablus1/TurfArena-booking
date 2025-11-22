import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { Toaster } from '@/src/components/ui/toaster';
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Juja Turf Arena - Book Your Football Turf Online",
  description: "Book football turf in Juja easily. M-Pesa payment, instant confirmation, and digital tickets.",
  keywords: "football turf, Juja, booking, M-Pesa, sports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}