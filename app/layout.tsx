import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/shared/navbar";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ConditionalNavbar from "@/components/shared/ConditionalNavbar";
import { AuthProvider } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
  openGraph: {
    title: "HireCore Local",
    description: "Find verified local work opportunities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary-foreground">
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
