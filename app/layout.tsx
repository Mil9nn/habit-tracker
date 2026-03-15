import type { Metadata } from "next";
import AuthWrapper from "@/components/AuthWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Water Tracker",
  description: "Track your daily water intake and stay hydrated",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-losevka"
      >
        <AuthWrapper>
        {children}
      </AuthWrapper>
      </body>
    </html>
  );
}
