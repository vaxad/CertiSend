import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/navbar";

const font = Space_Grotesk({
  subsets: ['latin'],
});
export const metadata: Metadata = {
  title: "CertiSend",
  description: "Generated by vaxad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <div className="w-full h-full min-h-screen flex flex-col max-w-7xl z-50 pb-12 mx-auto px-6">
            <Navbar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
