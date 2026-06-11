import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/i18n/context";
import { CurrencyProvider } from "@/context/CurrencyContext";
import CookieConsent from "@/components/CookieConsent";

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
        <LanguageProvider>
          <CurrencyProvider>
            {children}
            <CookieConsent />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
