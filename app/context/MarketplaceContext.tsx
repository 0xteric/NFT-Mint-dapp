"use client"

import { createContext, useContext, useEffect } from "react"
import { useMarketplaceListingsIndex, useMarketplaceBidsIndex, useMarketplaceInfo } from "@/components/Contract"

export const MarketplaceContext = createContext<any>(null)

export function MarketplaceDataProvider({ children }: { children: React.ReactNode }) {
  const info = useMarketplaceInfo()
  const { data: dataBids, triggerRefresh: triggerBidsRefresh } = useMarketplaceBidsIndex(BigInt("9997891"))
  const { data: dataCore, triggerRefresh: triggerListingsRefresh } = useMarketplaceListingsIndex(BigInt("9997891"))

  return (
    <MarketplaceContext.Provider
      value={{
        info,
        bidsIndex: dataBids,
        listingsIndex: dataCore?.listings,
        listingEvents: dataCore?.listingEvents,
        tokenBidEvents: dataBids?.tokenBidEvents,
        collectionBidEvents: dataBids?.collectionBidEvents,
        collections: dataCore?.collections,
        triggerListingsRefresh,
        triggerBidsRefresh,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  )
}

export const useMarketplace = () => {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) {
    throw new Error("useMarketplace must be used inside MarketplaceDataProvider")
  }
  return ctx
}
