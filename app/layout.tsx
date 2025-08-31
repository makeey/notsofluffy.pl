import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MaintenanceCheck } from "@/components/MaintenanceCheck";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NotSoFluffy - Sklep Online",
    template: "%s | NotSoFluffy",
  },
  description:
    "NotSoFluffy - Twój sklep online z najlepszymi produktami. Odkryj naszą kolekcję i zamów z dostawą do domu.",
  keywords: ["sklep online", "e-commerce", "produkty", "zakupy", "NotSoFluffy"],
  authors: [{ name: "NotSoFluffy Team" }],
  creator: "NotSoFluffy",
  publisher: "NotSoFluffy",
  metadataBase: new URL("https://notsofluffy.pl"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://notsofluffy.pl",
    title: "NotSoFluffy - Sklep Online",
    description:
      "NotSoFluffy - Twój sklep online z najlepszymi produktami. Odkryj naszą kolekcję i zamów z dostawą do domu.",
    siteName: "NotSoFluffy",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "NotSoFluffy - Sklep Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NotSoFluffy - Sklep Online",
    description:
      "NotSoFluffy - Twój sklep online z najlepszymi produktami. Odkryj naszą kolekcję i zamów z dostawą do domu.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    //google: "your-google-verification-code",
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="notsofluffy-ui-theme">
          <AuthProvider>
            <CartProvider>
              <MaintenanceCheck>{children}</MaintenanceCheck>
            </CartProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
