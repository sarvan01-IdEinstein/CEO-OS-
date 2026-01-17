import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import ChiefOfStaff from "./components/ChiefOfStaff";
import { SidebarProvider } from "./components/SidebarContext";
import { ToastProvider } from "./components/ToastContext";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const merriweather = Merriweather({ weight: ["300", "400", "700", "900"], subsets: ["latin"], variable: '--font-serif' });

export const metadata: Metadata = {
  title: "CEO Personal OS",
  description: "Executive Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} flex min-h-screen bg-[var(--bg-app)] text-[var(--fg)] font-sans selection:bg-[var(--accent)] selection:text-white`}>
        {/* Skip to content - Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <SidebarProvider>
            <Sidebar />
            <main id="main-content" className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-auto h-screen relative pt-16 lg:pt-8" role="main">
              {children}
              <ChiefOfStaff />
            </main>
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
