import type { Metadata } from "next";
import AuthWrapper from "@/components/AuthWrapper";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaloMind - Track what you Eat, Feel the Difference",
  description: "Track your daily nutrition with precision and clarity - Your intelligent calorie and macro tracking companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased font-inter text-white min-h-screen"
      >
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
