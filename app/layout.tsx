"use client"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import Header from "@/components/Header"
import { ThemeProvider } from "next-themes"
import { MarketplaceDataProvider } from "./context/MarketplaceContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div
            className="
            min-h-screen w-full flex flex-col relative overflow-x-hidden
              transition-colors duration-300
            "
          >
            <Providers>
              <MarketplaceDataProvider>
                <Header />
                <main
                  className=" 
                 p-5            flex flex-col
               items-center justify-center"
                >
                  {children}
                </main>
                <footer className="p-2 text-xs mt-auto text-center">Built with Next.js, Wagmi, Viem & Foundry</footer>
              </MarketplaceDataProvider>
            </Providers>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
