import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a fallback, Geist is good.
import './globals.css';
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is correctly imported

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans", // Changed from --font-geist-sans to --font-sans based on new import
});

// Keeping Geist from original if preferred, but Inter is also a good modern choice.
// For consistency with potential ShadCN defaults, using --font-sans.
// If Geist is specifically required:
// import { Geist, Geist_Mono } from 'next/font/google';
// const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
// const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
// And update className below to: `${geistSans.variable} ${geistMono.variable} font-sans antialiased`

export const metadata: Metadata = {
  title: 'Eleon - Modern Hotel Access',
  description: 'Experience seamless room access and control with Eleon.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased", // Using font-sans based on Inter import
          fontSans.variable
        )}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
