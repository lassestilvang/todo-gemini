import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import TransitionProvider from "@/components/transition-provider";
import { Menu } from "lucide-react"; // Import Menu icon
import { Button } from "@/components/ui/button"; // Import Button
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Task Planner",
  description: "A modern, professional Next.js daily task planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased font-sans"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen"> {/* Added min-h-screen */}
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Mobile Header and Sidebar */}
            <div className="flex-1 flex flex-col">
              <header className="md:hidden flex items-center justify-between p-4 border-b border-border">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    <Sidebar />
                  </SheetContent>
                </Sheet>
                <h1 className="text-lg font-semibold">n0rd</h1>
                <ThemeToggle /> {/* ThemeToggle moved here */}
              </header>
              <main className="flex-1 p-4 md:p-8"> {/* Adjusted padding */}
                <TransitionProvider>{children}</TransitionProvider>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
