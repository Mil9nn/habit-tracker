import type { Metadata } from "next";
import AuthWrapper from "@/components/AuthWrapper";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaloMind",
  description: "Track your daily nutrition with precision and clarity - Your intelligent calorie and macro tracking companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
