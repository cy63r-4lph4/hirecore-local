import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ConditionalNavbar from "@/components/shared/ConditionalNavbar";
import { AuthProvider } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://gh.hirecore.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "HireCore Local - Find Local Work",
    template: "%s | HireCore Local",
  },

  description:
    "A controlled workforce marketplace connecting skilled workers with trusted local opportunities.",

  keywords: ["jobs", "local work", "workforce", "marketplace", "hire"],

  icons: {
    icon: [
      {
        url: "/Icons/favicon.ico",
        sizes: "any",
      },
      {
        url: "/Icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/Icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/Icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "manifest",
        url: "/Icons/site.webmanifest",
      },
    ],
  },

  openGraph: {
    title: "HireCore Local",
    description:
      "Find trusted local work opportunities reviewed through HireCore Local.",
    url: siteUrl,
    siteName: "HireCore Local",
    type: "website",
    images: [
      {
        url: "/hirecore-local.png",
        width: 1200,
        height: 630,
        alt: "HireCore Local - Trusted local work near you",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HireCore Local",
    description:
      "Find trusted local work opportunities reviewed through HireCore Local.",
    images: ["/hirecore-local.png"],
  },
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("hirecore-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : prefersDark
          ? "dark"
          : "light";

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, inter.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary-foreground">
        <ThemeProvider>
          <AuthProvider>
            <ConditionalNavbar />

            <main className="relative flex min-h-screen flex-col bg-transparent">
              {children}
            </main>

            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}