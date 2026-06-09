import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANOM | Premium Grooming Experience",
  description: "Where traditional craftsmanship meets modern luxury. Experience grooming elevated to an art form.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
