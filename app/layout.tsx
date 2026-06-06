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

export const metadata: Metadata = {
  title: "HireCore Local - Find Local Work",
  description:
    "A controlled workforce marketplace connecting skilled workers with local opportunities.",
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
    description: "Find verified local work opportunities.",
    type: "website",
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