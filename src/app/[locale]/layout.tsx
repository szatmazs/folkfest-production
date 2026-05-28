import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import type { Metadata } from "next";
import { Open_Sans, Roboto_Slab } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { clsx } from "clsx";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  weight: ["100", "300", "400", "700", "900"]
});

const saintAgnes = localFont({
  src: "../../../public/fonts/Saint-Agnes.otf",
  variable: "--font-saint-agnes",
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: "FolkFest Kulturális Egyesület",
    template: "%s | FolkFest Kulturális Egyesület"
  },
  description: "A FolkFest Kulturális Egyesület hivatalos weboldala. Kulturális értékteremtés, hagyományőrzés és tehetséggondozás a Kárpát-medencében.",
  metadataBase: new URL('https://folkfest.hu'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FolkFest Kulturális Egyesület",
    description: "A FolkFest Kulturális Egyesület hivatalos weboldala. Kulturális értékteremtés, hagyományőrzés és tehetséggondozás a Kárpát-medencében.",
    url: 'https://folkfest.hu',
    siteName: 'FolkFest',
    locale: 'hu_HU',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'FolkFest Kulturális Egyesület',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "FolkFest Kulturális Egyesület",
    description: "A FolkFest Kulturális Egyesület hivatalos weboldala.",
    images: ['/logo.png'],
  },
  icons: {
    icon: "/favicon.png?v=4",
  },
};

import { CookieConsent } from "@/components/features/cookie-consent";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        suppressHydrationWarning={true}
        className={clsx(
          openSans.variable,
          robotoSlab.variable,
          saintAgnes.variable,
          "font-sans antialiased text-gray-900 bg-white"
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <LayoutWrapper navbar={<Navbar locale={locale} />} footer={<Footer locale={locale} />}>
            {children}
          </LayoutWrapper>
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
