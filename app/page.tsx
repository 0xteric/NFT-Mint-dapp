"use client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount } from "wagmi"
import { useEffect, useState, useMemo } from "react"
import ListedNFTS from "@/components/ListedNFTS"
import ListNftWithApproval from "@/components/ListNFT"
import { FaUser } from "react-icons/fa"
import { FaShop } from "react-icons/fa6"
import { SortBy, SortDir } from "@/lib/constants"
import { useMarketplaceListings } from "@/components/Contract"
import { FaArrowDown } from "react-icons/fa"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [pageCard, setPageCard] = useState("marketplace")
  const [sortBy, setSortBy] = useState<SortBy>("price")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const { address } = useAccount()
  const { data: listings = [], isLoading } = useMarketplaceListings(BigInt("9967517"))

  useEffect(() => {
    setMounted(true)
  }, [])

  const userListings = useMemo(() => listings.filter((l) => l.seller.toLowerCase() === address?.toLowerCase()), [listings, address])

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
          <div className="border-b border-(--accent)/50">
            <div className="flex justify-between items-center">
              <div className="flex">
                <button
                  onClick={() => setPageCard("marketplace")}
                  className={"flex gap-2 items-center p-4  text-(--accent)! hover:opacity-50! bg-transparent!  " + (pageCard == "marketplace" ? " opacity-50" : "")}
                >
                  <FaShop />
                  <span className="hidden md:block">Marketplace</span>
                </button>
                <button onClick={() => setPageCard("user")} className={"flex gap-2 items-center p-4  text-(--accent)! hover:opacity-50! bg-transparent!  " + (pageCard == "user" ? " opacity-50" : "")}>
                  <FaUser />
                  <span className="hidden md:block">Items</span>
                </button>
              </div>
              <div className="flex ">
                <button
                  onClick={() => {
                    setSortBy("price")
                    setSortDir(sortDir == "asc" ? "desc" : "asc")
                  }}
                  className="p-4 bg-transparent! flex items-center gap-2 text-(--accent)! hover:opacity-100!"
                >
                  <span>Price</span>
                  <FaArrowDown
                    className={`
                      transition-transform
                      ${sortBy !== "price" ? "opacity-50" : ""}
                      ${sortBy === "price" && sortDir === "asc" ? "rotate-180" : ""}
                    `}
                  />
                </button>
                <button
                  onClick={() => {
                    setSortBy("id")
                    setSortDir(sortDir == "asc" ? "desc" : "asc")
                  }}
                  className="p-4 bg-transparent! flex items-center gap-2 text-(--accent)! hover:opacity-100!"
                >
                  <span>Id</span>
                  <FaArrowDown
                    className={`
                      transition-transform
                      ${sortBy !== "id" ? "opacity-50" : ""}
                      ${sortBy === "id" && sortDir === "asc" ? "rotate-180" : ""}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-(--accent)/20">
            {pageCard == "marketplace" && (
              <div>
                <ListedNFTS listings={listings} userListings={userListings} sortBy={sortBy} sortDir={sortDir} />
              </div>
            )}
            {pageCard == "user" && (
              <div>
                <ListNftWithApproval listings={[]} userListings={userListings} sortBy={sortBy} sortDir={sortDir} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
