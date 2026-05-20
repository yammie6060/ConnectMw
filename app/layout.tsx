import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://connectmw.com"),
  title: {
    default: "ConnectMW - Rentals, Beauty Services, and Auto Spares in Malawi",
    template: "%s | ConnectMW",
  },
  description:
    "Malawi's all-in-one platform for rentals, beauty services, and auto spares. Verified. Secure. Local.",
  keywords: ["ConnectMW","connect malawi", "Malawi rentals", "Malawi houses", "beauty services Malawi", "auto spares Malawi", "spare parts Malawi"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ConnectMW - Local services across Malawi",
    description: "Find rentals, beauty services, and auto spare parts from local providers in Malawi.",
    url: "/",
    siteName: "ConnectMW",
    locale: "en_MW",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ConnectMW",
    description: "Malawi's platform for rentals, beauty services, and auto spares.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
