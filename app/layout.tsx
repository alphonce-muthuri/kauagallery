import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { PullToRefresh } from "@/components/pwa/pull-to-refresh";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { MobileTabBar } from "@/components/layout/mobile-tabbar";
import { UploadDialog } from "@/components/gallery/upload-dialog";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const APP_NAME = "Kaua's ";
const APP_DESCRIPTION =
  "A private memory library for the Kaua family -rooted in faith, rich in love. God is good, all the time.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} -a private family photo library`,
    template: `%s -${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} -a private family photo library`,
    description: APP_DESCRIPTION,
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME} -a private family photo library`,
    description: APP_DESCRIPTION,
    images: ["/icons/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5EFDF" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ea580c",
          borderRadius: "14px",
        },
        elements: {
          footer: "hidden",
          footerAction: "hidden",
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${bodoniModa.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground pb-tabbar">
          <div className="pointer-events-none fixed inset-0 -z-10 mac-glow" />
          <PullToRefresh />
          {children}
          <MobileTabBar />
          <UploadDialog />
          <InstallPrompt />
          <ServiceWorkerRegistrar />
          <Toaster
            position="bottom-right"
            theme="light"
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "group !rounded-2xl !border !border-border !bg-background/95 !text-foreground !backdrop-blur-xl !shadow-[0_18px_40px_-20px_rgba(0,0,0,0.3)]",
                title: "!text-foreground !font-semibold",
                description: "!text-muted-foreground",
                icon: "!text-primary",
                loader: "!text-primary",
                actionButton:
                  "!bg-primary !text-primary-foreground !rounded-lg !px-3 !py-1.5 !font-medium",
                cancelButton:
                  "!bg-muted !text-muted-foreground !rounded-lg !px-3 !py-1.5",
                closeButton:
                  "!bg-background !text-foreground !border !border-border hover:!bg-muted",
                success: "!text-foreground",
                error: "!text-foreground",
                warning: "!text-foreground",
                info: "!text-foreground",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
