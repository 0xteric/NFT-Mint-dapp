"use client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount, usePublicClient } from "wagmi"
import { useEffect, useState } from "react"
import ListedNFTS from "@/components/ListedNFTS"
import ListNftWithApproval from "@/components/ListNFT"
import { FaUser } from "react-icons/fa"
import { FaShop } from "react-icons/fa6"
import { indexMarketplace } from "@/components/useMarketplaceIndex"
import { ListedNft } from "@/lib/constants"

export default function Home() {
  const publicClient = usePublicClient()

  const [mounted, setMounted] = useState(false)
  const [pageCard, setPageCard] = useState("marketplace")
  const [listings, setListings] = useState<ListedNft[]>([])
  const [userListings, setUserListings] = useState<ListedNft[]>([])
  const { address } = useAccount()

  useEffect(() => {
    setMounted(true)
    loadMarketplace()
  }, [])

  useEffect(() => {
    setUserListings(listings.filter((l) => l.seller.toLowerCase() == String(address).toLowerCase()))
  }, [listings])

  const loadMarketplace = async () => {
    const logs = await indexMarketplace(publicClient, BigInt("9967517"))
    setListings(logs.filter((l) => l.status === "ACTIVE"))
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 font-sans w-full  text-center  ">
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
            <Link href="/mint">
              <button className="py-2 px-4 rounded-4xl mt-3 w-fit flex gap-2 hover:opacity-85 ">
                <span>Go to mint</span>
                <span>&rarr;</span>
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="w-full mt-5 relative p-10">
        <div className="card bg-(--bg-secondary) border border-(--accent)/20 rounded w-full">
          <div className="border-b border-(--accent)/30!">
            <div className="flex">
              <button
                onClick={() => setPageCard("marketplace")}
                className={"flex gap-2 items-center p-4 bg-transparent! text-(--accent)! " + (pageCard == "marketplace" ? "opacity-50 hover:opacity-50!" : "")}
              >
                <FaShop />
                <span className="hidden md:block">Marketplace</span>
              </button>
              <button onClick={() => setPageCard("user")} className={"flex gap-2 items-center p-4 bg-transparent! text-(--accent)! " + (pageCard == "user" ? "opacity-50 hover:opacity-50!" : "")}>
                <FaUser />
                <span className="hidden md:block">Items</span>
              </button>
            </div>
          </div>
          <div className="p-4 bg-(--accent)/20">
            {pageCard == "marketplace" && (
              <div>
                <ListedNFTS listings={listings} userListings={userListings} />
              </div>
            )}
            {pageCard == "user" && (
              <div>
                <ListNftWithApproval listings={[]} userListings={userListings} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
