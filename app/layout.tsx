import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import ChiefOfStaff from "./components/ChiefOfStaff";

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
        <Sidebar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
          {children}
          <ChiefOfStaff />
        </main>
      </body>
    </html>
  );
}
