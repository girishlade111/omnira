import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFrame } from '@/components/layout';
import { LoadingScreen } from '@/components/motion';
import { siteConfig } from '@/config/site';
import { PUBLIC_ASSETS } from '@/lib/assets';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: 'Omnira | Futuristic Portfolio & Digital Systems',
    template: '%s | Omnira',
  },
  description: siteConfig.description,
  icons: {
    icon: PUBLIC_ASSETS.brand.favicon,
    apple: PUBLIC_ASSETS.brand.appleTouchIcon,
  },
  openGraph: {
    title: 'Omnira | Futuristic Portfolio & Digital Systems',
    description: siteConfig.description,
    type: 'website',
    siteName: siteConfig.brandTitle,
    images: [
      {
        url: PUBLIC_ASSETS.brand.ogImage.fallback,
        width: PUBLIC_ASSETS.brand.ogImage.width,
        height: PUBLIC_ASSETS.brand.ogImage.height,
        alt: PUBLIC_ASSETS.brand.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omnira | Futuristic Portfolio & Digital Systems',
    description: siteConfig.description,
    images: [PUBLIC_ASSETS.brand.ogImage.fallback],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/fonts/fonts.css" />
      </head>
      <body>
        <LoadingScreen />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
