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
import { useMarketplaceIndex, useMarketplaceInfo, useBidCollection } from "@/components/Contract"
import { FaArrowDown } from "react-icons/fa"
import { TbHammer } from "react-icons/tb"
import { IoClose } from "react-icons/io5"
import { parseEther } from "viem"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [pageCard, setPageCard] = useState("marketplace")
  const [sortBy, setSortBy] = useState<SortBy>("price")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [bidCollectionDiv, setBidCollectionDiv] = useState<boolean>(false)
  const [collectionBidAmount, setCollectionBidAmount] = useState<number>()
  const [collectionBidPrice, setCollectionBidPrice] = useState<number>()

  const { address } = useAccount()
  const { totalVolume, totalSales, marketplaceFee, refetchTotalVolume, refetchTotalSales } = useMarketplaceInfo()
  const { data: marketplace = { listings: [], tokenBids: [] }, isLoading } = useMarketplaceIndex(BigInt("9967517"))
  const { bidCollection } = useBidCollection()
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    console.log(marketplace.tokenBids)
  }, [marketplace.tokenBids.length])

  const userListings = useMemo(() => marketplace.listings.filter((l) => l.seller.toLowerCase() === address?.toLowerCase()), [marketplace.listings, address])

  const handleBidCollection = async () => {
    console.log("bid1")
    if (collectionBidPrice && collectionBidAmount && !(collectionBidPrice > 0) && !(collectionBidAmount > 0)) return
    console.log("bid2")
    const hash = await bidCollection(parseEther(Number(collectionBidPrice).toString()), Number(collectionBidAmount))
  }
  const handleClose = (event: any) => {
    if (event.target.id === "bcd_bg") {
      setBidCollectionDiv(false)
      setCollectionBidAmount(undefined)
      setCollectionBidPrice(undefined)
    }
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
              <button className="py-2 px-4 rounded-4xl mt-3 w-fit flex gap-2 hover:opacity-85  ">
                <span>Go to mint</span>
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
            {(Number(totalVolume) / 1e18).toFixed(2) + " ETH"}
          </div>

          <div>
            <span className="  text-(--accent)/75">Total sales: </span>
            {Number(totalSales)}
          </div>
          <div>
            <span className="  text-(--accent)/75">Marketplace fee: </span>
            {Number(marketplaceFee) / 100 + "%"}
          </div>
        </div>
        <div className="card bg-(--bg-secondary) border border-(--accent)/20 rounded w-full">
          <div className="border-b border-(--accent)/50">
            <div className="flex justify-between items-center">
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
                  <span className="hidden md:block">Items</span>
                </button>
                <div className="border-l border-(--accent)/20"></div>
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
                <div className="border-l border-(--accent)/20"></div>
              </div>

              <div className="flex border-l border-(--accent)/20 ">
                <button onClick={() => setBidCollectionDiv(true)} className=" p-5 md:p-4 bg-transparent! flex items-center gap-2 text-(--accent)! ">
                  <TbHammer />
                  <span className="md:block hidden">Place collection bid</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-(--accent)/20">
            {pageCard == "marketplace" && (
              <div>
                <ListedNFTS
                  listings={marketplace.listings}
                  userListings={userListings}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  refetchTotalSales={refetchTotalSales}
                  refetchTotalVolume={refetchTotalVolume}
                />
              </div>
            )}
            {pageCard == "user" && (
              <div>
                <ListNftWithApproval listings={[]} userListings={userListings} sortBy={sortBy} sortDir={sortDir} refetchTotalSales={{}} refetchTotalVolume={{}} />
              </div>
            )}
          </div>
        </div>
      </section>
      {bidCollectionDiv && (
        <div id="bcd_bg" onClick={handleClose} className="top-0 bg-black/25 absolute w-screen h-full  flex items-center gap-2 text-(--accent)! justify-center z-200">
          <div className="card rounded">
            <div className="flex w-full justify-between  ">
              <div className="p-4 flex gap-4 text-(--accent)/80 items-center">
                <TbHammer className="text-2xl " />
                <h2 className=" text-xl">Place collection bid</h2>
              </div>

              <button onClick={() => setBidCollectionDiv(false)} className=" p-4  bg-transparent! flex items-center gap-2 text-(--accent)! ">
                <IoClose />
              </button>
            </div>
            <div className="p-4 flex flex-col">
              <div className="flex  gap-2 items-center justify-center rounded border border-(--accent)/50 bg-(--accent)/30 overflow-hidden">
                <div className="p-4 flex gap-2 items-center">
                  <span className="font-bold ">Price: </span>
                  <input type="number" value={collectionBidPrice} onChange={(e: any) => setCollectionBidPrice(e.target.value)} placeholder="0.0 ETH" className=" bg-transparent! w-20" />
                </div>
                <div className="py-4 flex gap-2 items-center">
                  <span className="font-bold ">Amount: </span>
                  <input type="number" value={collectionBidAmount} onChange={(e: any) => setCollectionBidAmount(e.target.value)} placeholder="0" className="w-10 bg-transparent!" />
                </div>
                <button onClick={handleBidCollection} className="p-4 px-6 border-l border-(--accent)/50 flex items-center gap-2 ">
                  Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
