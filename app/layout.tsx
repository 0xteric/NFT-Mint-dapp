"use client"
import "./globals.css"
import { Providers } from "./providers"
import Header from "@/components/Header"
import { ThemeProvider } from "next-themes"
import { MarketplaceDataProvider } from "./context/MarketplaceContext"
import { TxProvider } from "./context/TxContext"
import { Space_Mono } from "next/font/google"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceMono.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div
            className="
            min-h-screen w-full flex flex-col relative overflow-x-hidden
              transition-colors duration-300
            "
          >
            <Providers>
              <TxProvider>
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
              </TxProvider>
            </Providers>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
