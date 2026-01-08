"use client"

import { createContext, useContext, useEffect } from "react"
import { useMarketplaceListingsIndex, useMarketplaceBidsIndex, useMarketplaceInfo } from "@/components/Contract"

export const MarketplaceContext = createContext<any>(null)

export function MarketplaceDataProvider({ children }: { children: React.ReactNode }) {
  const info = useMarketplaceInfo()
  const { data: dataBids } = useMarketplaceBidsIndex(BigInt("9997891"))
  const { data: dataCore } = useMarketplaceListingsIndex(BigInt("9997891"))

  return <MarketplaceContext.Provider value={{ info, bidsIndex: dataBids, listingsIndex: dataCore?.listings, collections: dataCore?.collections }}>{children}</MarketplaceContext.Provider>
}

export const useMarketplace = () => {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) {
    throw new Error("useMarketplace must be used inside MarketplaceDataProvider")
  }
  return ctx
}
