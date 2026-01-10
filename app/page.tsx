"use client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount } from "wagmi"
import { useEffect, useState, useMemo } from "react"
import ListedNFTS from "@/components/ListedNFTS"
import ListNftWithApproval from "@/components/ListNFT"
import { FaUser } from "react-icons/fa"
import { FaShop, FaGavel } from "react-icons/fa6"
import { useBidCollection } from "@/components/Contract"
import { IoClose } from "react-icons/io5"
import { parseEther } from "viem"
import { useMarketplace } from "@/app/context/MarketplaceContext"
import CollectionBids from "@/components/CollectionBids"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [pageCard, setPageCard] = useState("marketplace")

  const { address } = useAccount()

  const { info, bidsIndex, listingsIndex, collections } = useMarketplace()
  let userListings: any[] = []

  useEffect(() => {
    setMounted(true)
  }, [])
  userListings = useMemo(() => {
    if (listingsIndex) return listingsIndex.filter((l: any) => l.seller.toLowerCase() === address?.toLowerCase())
  }, [listingsIndex, address])

  return (
    <div className="flex flex-col items-center justify-center gap-4  w-full  text-center  ">
      <AnimatePresence>
        {mounted && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Thanks for reaching my dApp</h2>

            <p className="max-w-2xl">This project was built as a production-like NFT marketplace. Its goal is to showcase best practices in modern Web3 development.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 justify-center items-center"
          >
            <Link href="/launchpad">
              <button className="py-2 px-4 rounded-4xl mt-3 w-fit flex gap-2 hover:opacity-85  ">
                <span>Go to launchpad</span>
                <span>&rarr;</span>
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="w-full mt-5 relative py-10 flex flex-col gap-4">
        <div className="flex items-center justify-start w-full gap-4 text-(--accent) opacity-75 font-bold">
          <div>
            <span className="  text-(--accent)/75">Total volume: </span>
            {(info ? (Number(info.totalVolume) / 1e18).toFixed(2) : "-") + " ETH"}
          </div>

          <div>
            <span className="  text-(--accent)/75">Total sales: </span>
            {info ? Number(info.totalSales) : "-"}
          </div>
          <div>
            <span className="  text-(--accent)/75">Marketplace fee: </span>
            {(info ? Number(info.marketplaceFee) / 100 : "-") + "%"}
          </div>
        </div>
        <div className="card bg-(--bg-secondary) border border-(--accent)/20 rounded w-full overflow-hidden  ">
          <div className="border-b bg-(--bg-secondary) border-(--accent)/50 relative z-20">
            <div className="flex justify-between items-center ">
              <div className="flex">
                <button
                  onClick={() => setPageCard("marketplace")}
                  className={"flex gap-2 items-center p-4  text-(--accent)! hover:opacity-100! transition-all duration-300  bg-transparent!  " + (pageCard == "marketplace" ? " " : "opacity-50")}
                >
                  <FaShop />
                  <span className="hidden md:block">Marketplace</span>
                </button>
                <button
                  onClick={() => setPageCard("user")}
                  className={"flex gap-2 items-center p-4  text-(--accent)! hover:opacity-100! transition-all duration-300  bg-transparent!  " + (pageCard == "user" ? " " : "opacity-50")}
                >
                  <FaUser />
                  <span className="hidden md:block">Portfolio</span>
                </button>
              </div>
            </div>
          </div>
          <div className=" bg-(--accent)/20">
            {pageCard == "marketplace" && (
              <div>
                <ListedNFTS
                  tokenBids={bidsIndex ? bidsIndex.tokenBids : []}
                  collectionBids={bidsIndex ? bidsIndex.collectionBids : []}
                  listings={listingsIndex ? listingsIndex : []}
                  userListings={userListings}
                  refetchTotalSales={info ? info.refetchTotalSales : () => {}}
                  refetchTotalVolume={info ? info.refetchTotalVolume : () => {}}
                  collections={collections}
                />
              </div>
            )}
            {pageCard == "user" && (
              <div>
                <ListNftWithApproval
                  tokenBids={bidsIndex ? bidsIndex.tokenBids : []}
                  collectionBids={bidsIndex ? bidsIndex.collectionBids : []}
                  collections={collections}
                  listings={[]}
                  userListings={userListings}
                  refetchTotalSales={{}}
                  refetchTotalVolume={{}}
                />
              </div>
            )}
            {pageCard == "collectionBids" && (
              <div>
                <CollectionBids collectionBids={bidsIndex ? bidsIndex.collectionBids : []} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
