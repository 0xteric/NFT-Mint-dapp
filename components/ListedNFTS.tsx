"use client"

import { useEffect, useState } from "react"
import { usePublicClient, useAccount, useReadContracts } from "wagmi"
import { erc721Abi, Address } from "viem"
import { useBidToken, useBuy } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import { MarketplaceCoreABI } from "@/lib/abi"
import { ListedNFTSProps, SortBy, SortDir, CORE_CONTRACT_ADDRESS, ListedNft } from "@/lib/constants"
import { FaUsers, FaGavel, FaEthereum, FaExternalLinkAlt, FaArrowDown, FaSearch } from "react-icons/fa"
import { useQueryClient } from "@tanstack/react-query"
import { GrRadialSelected } from "react-icons/gr"
import { NFTCard } from "./NFTCard"
import { FiCopy } from "react-icons/fi"
import CollectionBids from "./CollectionBids"
import { HiOutlineCollection } from "react-icons/hi"
import { BuyCard } from "./BuyCard"
import { BidCard } from "./BidCard"
import { ColBidCard } from "./ColBidCard"

export default function ListedNFTS({ listings, collections = [], collectionBids }: ListedNFTSProps) {
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")
  const [colBidCard, setColBidCard] = useState<boolean>(false)
  const [bidCard, setBidCard] = useState<boolean>(false)
  const [buyCard, setBuyCard] = useState<boolean>(false)
  const [collectionSelected, setCollectionSelected] = useState<Address | string>(collections.length > 0 ? collections[0]?.collection : "")
  const [collectionCard, setCollectionCard] = useState<"items" | "bids" | "holders">("items")
  const [sortBy, setSortBy] = useState<SortBy>("price")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [buyBatch, setBuyBatch] = useState<ListedNft[]>([])
  const [bidBatch, setBidBatch] = useState<ListedNft[]>([])

  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { buy } = useBuy()
  const { bidToken } = useBidToken()

  const { data: names } = useReadContracts({
    contracts: collections.map((col) => ({
      address: col.collection,
      abi: erc721Abi,
      functionName: "name",
    })),
    query: {
      enabled: Boolean(collections.length),
    },
  })

  const { data: colsData, isLoading: isLoadingCore = true } = useReadContracts({
    contracts: collections.map((col: any) => ({
      address: CORE_CONTRACT_ADDRESS,
      abi: MarketplaceCoreABI,
      functionName: "collections",
      args: [col.collection],
    })),
    query: {
      enabled: Boolean(collections.length),
    },
  })

  useEffect(() => {
    if (collections.length == 0) return
    setCollectionSelected(collections[0].collection)
    setStatus("idle")
  }, [collections.length])

  function sortByField<T>(items: T[], getId: (item: T) => bigint, getPrice: (item: T) => bigint) {
    return [...items].sort((a, b) => {
      const aVal = sortBy === "id" ? getId(a) : getPrice(a)
      const bVal = sortBy === "id" ? getId(b) : getPrice(b)

      const diff = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortDir === "asc" ? diff : -diff
    })
  }
  let sortedListings: any[] = []
  if (listings)
    sortedListings = sortByField(
      listings,
      (l) => l.tokenId,
      (l) => l.price
    )

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
  }

  const getColData = (col: string = collectionSelected) => {
    if (!colsData) return
    return colsData?.find((c) => String(c.result[0]).toLowerCase() == col.toLowerCase())?.result
  }

  const addItemToBatch = (item: ListedNft, dir: string) => {
    switch (dir) {
      case "buy": {
        setBuyBatch((prev) => [...prev, item])
        break
      }
      case "bid": {
        setBidBatch((prev) => [...prev, item])
        break
      }
    }
  }

  const removeItemFromBatch = (item: ListedNft, dir: string) => {
    switch (dir) {
      case "buy": {
        setBuyBatch((prev) => prev.filter((i) => i.id !== item.id))
        break
      }
      case "bid": {
        setBidBatch((prev) => prev.filter((i) => i.tokenId !== item.tokenId || i.collection !== item.collection))
        break
      }
    }
  }

  const isInBatch = (item: ListedNft, dir: string) => {
    switch (dir) {
      case "buy": {
        return buyBatch.some((b) => b.tokenId === item.tokenId && b.collection === item.collection)
        break
      }
      case "bid": {
        return bidBatch.some((b) => b.tokenId === item.tokenId && b.collection === item.collection)
        break
      }
    }
  }

  const getFloorPrice = (collection: any = collectionSelected) => {
    return listings.length ? listings.filter((l) => String(l.collection).toLowerCase() == String(collection).toLowerCase()).sort((a, b) => Number(a.price) - Number(b.price))[0].price : "0"
  }

  return (
    <div className="flex flex-col gap-2 relative ">
      <div className="flex items-center border-b border-(--accent)/30 p-4 gap-3">
        {status == "loading" && <div className="relative flex justify-center bg-(--bg-secondary)  rounded  py-5 px-24    animate-pulse"></div>}
        {collections.map((col, index) => {
          const floor: any = getFloorPrice(col.collection)
          return (
            <div
              onClick={() => setCollectionSelected(col.collection)}
              className={
                "hover:border-(--accent)/80 hover:cursor-pointer rounded items-center gap-6 border  card py-2 px-6 flex " +
                (String(collectionSelected).toLowerCase() == String(col.collection).toLowerCase() ? "border-(--accent)/80" : "border-(--accent)/50")
              }
              key={col.collection}
            >
              <div>
                <GrRadialSelected className={String(collectionSelected).toLowerCase() == String(col.collection).toLowerCase() ? "text-(--accent)!" : "text-[white]/15!"} />
              </div>
              <div className="flex flex-col items-start justify-center">
                <div>
                  <span className=" font-bold">{names?.length ? String(names[index].result) : "-"}</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-end h-full">
                <div className="flex items-center  gap-2 h-min">
                  <span>{Number(floor) / 1e18}</span>
                  <FaEthereum />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 flex items-center w-full">
        <div className="flex items-center gap-4 w-full">
          <h2 className="font-bold text-2xl">{names ? names[collections.findIndex((col) => String(col.collection).toLowerCase() == collectionSelected.toLowerCase())]?.result : "-"}</h2>
          <button onClick={() => copyToClipboard(collectionSelected)} className="bg-transparent! text-(--text-secondary)! hover:opacity-75! ml-4">
            <FiCopy className=" text-xl" />
          </button>
          <a href={`https://sepolia.etherscan.io/token/${collectionSelected}`} target="_blank">
            <FaExternalLinkAlt className="hover:opacity-75 hover:cursor-pointer text-[17px]" />
          </a>
          <div className="flex items-center ">
            <div className="rounded card px-2 py-1 border text-xs">{getColData() ? Number(getColData()[2]) / 100 : "-"}%</div>
          </div>
          <div className="flex items-center w-full px-5 gap-5">
            <div className="card py-2 px-4 rounded-xl border border-(--accent)/30 flex flex-col">
              <span className="font-bold text-xs opacity-75">TOTAL VOLUME</span>
              <div className="flex gap-1 items-center justify-center">
                <span>{getColData() ? Number(getColData()[3]) / 1e18 : "-"}</span>
                <FaEthereum />
              </div>
            </div>
            <div className="card py-2 px-4 rounded-xl border border-(--accent)/30 flex flex-col">
              <span className="font-bold text-xs opacity-75">TOTAL SALES</span>
              <span>{getColData() ? getColData()[4] : "-"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col px-4">
        <div className="flex items-center px-4 border-b border-(--accent)/30">
          <button
            onClick={() => setCollectionCard("items")}
            className={
              "bg-transparent! flex items-center gap-2 px-4 py-2 border-b " + (collectionCard == "items" ? "border-(--accent) text-(--accent)!" : "border-transparent! text-(--text-secondary)!")
            }
          >
            <HiOutlineCollection />
            <span>Items</span>
          </button>
          <button
            onClick={() => setCollectionCard("bids")}
            className={
              "bg-transparent! flex items-center gap-2 px-4 py-2 border-b " + (collectionCard == "bids" ? "border-(--accent) text-(--accent)!" : "border-transparent! text-(--text-secondary)!")
            }
          >
            <FaGavel />
            <span>Bids</span>
          </button>
          <button
            onClick={() => setCollectionCard("holders")}
            className={
              "bg-transparent! flex items-center gap-2 px-4 py-2 border-b " + (collectionCard == "holders" ? "border-(--accent) text-(--accent)!" : "border-transparent! text-(--text-secondary)!")
            }
          >
            <FaUsers />
            <span>Holders</span>
          </button>
        </div>
        <div className="flex w-full justify-between items-center pt-4">
          {collectionCard == "items" && (
            <div className="flex gap-4 items-center">
              <label className="flex  px-4 gap-2 items-center rounded card">
                <FaSearch className="opacity-65" />
                <input type="text" placeholder="Search token id" className=" p-2 bg-transparent!" />
              </label>
              <button
                onClick={() => setBuyCard(true)}
                disabled={!buyBatch.length}
                className={" flex items-center py-1 gap-3  px-6 rounded  border border-(--accent)  " + (buyBatch.length ? "text-(--bg-secondary)!" : " bg-transparent! text-(--accent)!")}
              >
                <span>BUY</span>
                <span>{buyBatch.length}</span>
              </button>
              <button
                onClick={() => setBidCard(true)}
                disabled={!bidBatch.length}
                className={" flex items-center py-1 gap-3  px-6 rounded  border border-(--accent)  " + (bidBatch.length ? "text-(--bg-secondary)!" : " bg-transparent! text-(--accent)!")}
              >
                <span>BID</span>
                <span>{bidBatch.length}</span>
              </button>
              <div className="flex items-center px-4">
                <button
                  onClick={() => {
                    if (sortBy == "price") {
                      setSortDir(sortDir == "asc" ? "desc" : "asc")
                    } else {
                      setSortBy("price")
                    }
                  }}
                  className="py-2 px-4 bg-transparent! rounded  flex items-center gap-2 text-(--text-secondary)! hover:opacity-100! "
                >
                  <span>Price</span>
                  <FaArrowDown
                    className={`
                              transition-transform
                              ${sortBy !== "price" ? "opacity-50" : "text-(--accent)!"}
                              ${sortBy === "price" && sortDir === "asc" ? "rotate-180" : ""}
                            `}
                  />
                </button>
                <button
                  onClick={() => {
                    if (sortBy == "id") {
                      setSortDir(sortDir == "asc" ? "desc" : "asc")
                    } else {
                      setSortBy("id")
                    }
                  }}
                  className="py-2 px-4 bg-transparent! rounded  flex items-center gap-2 text-(--text-secondary)! hover:opacity-100!"
                >
                  <span>Id</span>
                  <FaArrowDown
                    className={`
                              transition-transform
                              ${sortBy !== "id" ? "opacity-50" : "text-(--accent)!"}
                              ${sortBy === "id" && sortDir === "asc" ? "rotate-180" : ""}
                            `}
                  />
                </button>
              </div>
            </div>
          )}
          <div className="flex grow justify-between gap-4 ">
            <div></div>
            <button onClick={() => setColBidCard(true)} className="rounded px-5 py-2 flex items-center text-(--bg-secondary)! gap-4 ">
              <FaGavel />
              <span>Place collection bid </span>
            </button>
          </div>
        </div>

        {status == "loading" && (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 py-4">
            <div className="w-full relative flex justify-center  aspect-9/12  px-4  animate-pulse">
              <div className="absolute w-full h-full bg-(--accent) opacity-50 rounded"></div>
            </div>
          </div>
        )}

        {collectionCard == "items" && (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 py-4">
            {sortedListings.map((l, index) => {
              return (
                <AnimatePresence key={l.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.1 }}
                    className={
                      " aspect-9/12 min-w-25 relative border-2  hover:border-white hover:cursor-pointer bg-(--accent) rounded  overflow-hidden text-white " +
                      (isInBatch(l, "buy") ? "border-(--accent)! " : "border-(--bg-secondary)") +
                      (isInBatch(l, "bid") ? " border-(--accent)!" : " border-(--bg-secondary)")
                    }
                    onClick={() => {
                      if (isInBatch(l, "buy")) {
                        removeItemFromBatch(l, "buy")
                      } else {
                        addItemToBatch(l, "buy")
                      }
                      if (isInBatch(l, "bid")) {
                        removeItemFromBatch(l, "bid")
                      } else {
                        addItemToBatch(l, "bid")
                      }
                    }}
                  >
                    <NFTCard token={l} />
                  </motion.div>
                </AnimatePresence>
              )
            })}
          </div>
        )}
        {collectionCard == "bids" && (
          <div className="pt-4">
            <CollectionBids collectionBids={collectionBids} />
          </div>
        )}
        {collectionCard == "holders" && <div>{"na"}</div>}
      </div>

      <AnimatePresence>
        {buyCard && (
          <BuyCard buyItemsBatch={buyBatch} setBuyCard={setBuyCard} collections={collections} collectionSelected={collectionSelected} names={names} removeItemFromBatch={removeItemFromBatch} />
        )}
        {bidCard && (
          <BidCard
            bidItemsBatch={bidBatch}
            setBidCard={setBidCard}
            collections={collections}
            collectionSelected={collectionSelected}
            names={names}
            removeItemFromBatch={removeItemFromBatch}
            setBidBatch={setBidBatch}
          />
        )}
        {colBidCard && <ColBidCard floor={getFloorPrice} setColBidCard={setColBidCard} collectionSelected={collectionSelected} />}
      </AnimatePresence>
    </div>
  )
}
