"use client"

import { useState, useEffect } from "react"
import { Address, erc721Abi } from "viem"
import { useAccount, useReadContract, useWriteContract, useReadContracts } from "wagmi"
import { CORE_CONTRACT_ADDRESS, SortBy, SortDir } from "@/lib/constants"
import { useList, useUserTokens, useCancelList, useCancelCollectionBid, useCancelListBatch, useCancelTokenBid, useCancelTokenBidBatch } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import ConnectWallet from "./ConnectWallet"
import { FaSearch } from "react-icons/fa"
import { ListedNFTSProps, UserNft } from "@/lib/constants"
import { FiActivity, FiCopy } from "react-icons/fi"
import { FaExternalLinkAlt, FaHistory, FaTimes } from "react-icons/fa"
import { HiOutlineCollection } from "react-icons/hi"
import { FaInbox, FaGavel } from "react-icons/fa6"
import { NFTCard } from "./NFTCard"
import { CollectionLabel } from "./CollectionLabel"
import { useTx } from "@/app/context/TxContext"
import { ListCard } from "./ListCard"
import { MdOutlineLocalOffer } from "react-icons/md"
import CollectionBids from "./CollectionBids"
import TokenBids from "./TokenBids"
import History from "./Hirstory"
import { useMarketplace } from "@/app/context/MarketplaceContext"

export default function ListNftWithApproval({ userListings = [], collections = [], listings, collectionBids, tokenBids }: ListedNFTSProps) {
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")
  const [items, setUserItems] = useState<UserNft[]>([])
  const [collectionSelected, setCollectionSelected] = useState<Address | any>("")
  const [bidsOrItems, setBidsOrItems] = useState<"bids" | "items">("items")
  const [collectionView, setCollectionView] = useState<"inventory" | "colBids" | "tokenBids" | "history">("inventory")
  const [listPage, setListPage] = useState<boolean>(false)
  const [historyPage, setHistoryPage] = useState<boolean>(false)
  const [listItemsBatch, setlistItemsBatch] = useState<UserNft[]>([])
  const [delistItemsBatch, setdelistItemsBatch] = useState<UserNft[]>([])
  const [approveColsBatch, setApproveColsBatch] = useState<Address[]>([])
  const [cancelTokenBidItemsBatch, setCancelTokenBidItemsBatch] = useState<UserNft[]>([])
  const [sortBy, setSortBy] = useState<SortBy>("price")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [showColsCard, setShowColsCard] = useState<boolean>(false)
  const { cancelListBatch } = useCancelListBatch()
  const { cancelList } = useCancelList()
  const { cancelCollectionBid } = useCancelCollectionBid()
  const { cancelTokenBid } = useCancelTokenBid()
  const { cancelTokenBidBatch } = useCancelTokenBidBatch()
  const { addTx, updateTx, removeTx } = useTx()
  const { address }: any = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { publicClient } = useList()

  const collectionsReady = Boolean(collections?.length)
  const batchCollections = Array.from(new Set(items.map((i) => i.collection)))

  const { data: userTokensData, isLoading = true, refetch: refetchUserTokens } = useUserTokens(address, collections, collectionsReady)
  const { triggerListingsRefresh, triggerBidsRefresh } = useMarketplace()
  const { data: colName } = useReadContract({
    address: collectionSelected,
    abi: erc721Abi,
    functionName: "name",
  })
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
  useEffect(() => {
    console.log(!collectionsReady || isLoading || !userTokensData, userListings, listings)
    if (!collectionsReady || isLoading || !userTokensData) return

    const listingsMap = new Map(userListings.map((l) => [l.tokenId.toString() + "-" + l.collection.toString(), l]))

    const userItems: UserNft[] = userTokensData.tokens.map((token: any) => {
      const listing = listingsMap.get(token.tokenId.toString() + "-" + token.collection.toString())
      const name: string = String(getNFTName(token.collection))

      return {
        tokenId: token.tokenId,
        collection: token.collection,
        listed: Boolean(listing),
        price: listing?.price ?? BigInt(0),
        name,
        onBatch: false,
      }
    })

    setUserItems(userItems)
    setlistItemsBatch([])
    setdelistItemsBatch([])
    setApproveColsBatch([])
    setStatus("idle")
  }, [isLoading, userListings])

  const { data: approvals, refetch: refetchApprovals } = useReadContracts({
    contracts: batchCollections.map((col) => ({
      address: col,
      abi: erc721Abi,
      functionName: "isApprovedForAll",
      args: [address!, CORE_CONTRACT_ADDRESS],
    })),
    query: {
      enabled: Boolean(address && batchCollections.length),
    },
  })

  const approvalMap = batchCollections.reduce<Record<string, boolean>>((acc, col, i) => {
    acc[col.toLowerCase()] = Boolean(approvals?.[i]?.result)
    return acc
  }, {})

  const allApproved = batchCollections.every((col) => approvalMap[col.toLowerCase()])

  const approveCollection = async (collection: Address) => {
    if (!collection) return

    let hash: any

    try {
      hash = await writeContractAsync({
        address: collection,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [CORE_CONTRACT_ADDRESS, true],
      })

      addTx({ hash, status: "loading", label: "Approving collection" })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      updateTx(hash, { status: "success" })
      refetchApprovals()

      setTimeout(async () => {
        removeTx(hash)
      }, 3500)
    } catch (e) {
      updateTx(hash, { status: "error" })
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    }
  }

  const handleList = async () => {
    setListPage(true)
  }
  const handleDelist = async () => {
    if (!delistItemsBatch.length) return
    let hash: any
    try {
      if (delistItemsBatch.length > 1) {
        hash = await cancelListBatch(
          delistItemsBatch.map((c) => c.collection),
          delistItemsBatch.map((c) => c.tokenId)
        )
        addTx({ hash, status: "loading", label: "Delisting items" })
      } else {
        hash = await cancelList(delistItemsBatch[0].collection, Number(delistItemsBatch[0].tokenId))
        addTx({ hash, status: "loading", label: "Delisting item" })
      }
      await publicClient?.waitForTransactionReceipt({ hash })
      triggerListingsRefresh()
      updateTx(hash, { status: "success", label: "Delisted!" })
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    } catch (e) {
      updateTx(hash, { status: "error", label: "Delisting error!" })
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    }
  }

  const handleCancelTokenBid = async () => {
    if (!cancelTokenBidItemsBatch.length) return
    let hash: any
    try {
      if (cancelTokenBidItemsBatch.length > 1) {
        hash = await cancelTokenBidBatch(
          cancelTokenBidItemsBatch.map((c) => c.collection),
          cancelTokenBidItemsBatch.map((c) => c.tokenId)
        )
        addTx({ hash, status: "loading", label: "Canceling token bids" })
      } else {
        hash = await cancelTokenBid(cancelTokenBidItemsBatch[0].collection, Number(cancelTokenBidItemsBatch[0].tokenId))
        addTx({ hash, status: "loading", label: "Canceling token bid" })
      }
      await publicClient?.waitForTransactionReceipt({ hash })
      triggerListingsRefresh()
      updateTx(hash, { status: "success", label: "Cancelled!" })
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    } catch (e) {
      updateTx(hash, { status: "error", label: "Canceling error!" })
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    }
  }

  function sortByField<T>(items: T[], getId: (item: T) => bigint, getPrice: (item: T) => bigint) {
    return [...items].sort((a, b) => {
      const aVal = sortBy === "id" ? getId(a) : getPrice(a)
      const bVal = sortBy === "id" ? getId(b) : getPrice(b)

      const diff = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortDir === "asc" ? diff : -diff
    })
  }

  function getNFTName(collection: Address) {
    try {
      const name = names ? names[collections.findIndex((col) => String(col.collection) == String(collection))].result : "-"
      return name
    } catch (e) {
      console.log(e)
      return "name"
    }
  }

  const sortedUserItems = sortByField(
    items,
    (i) => i.tokenId,
    (i) => i.price || BigInt(0)
  )

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
  }
  const addItemToBatch = (item: UserNft, dir: string) => {
    switch (dir) {
      case "list": {
        setlistItemsBatch((prev) => [...prev, item])
        break
      }
      case "approve": {
        setApproveColsBatch((prev) => [...prev, item.collection])
        break
      }
      case "delist": {
        setdelistItemsBatch((prev) => [...prev, item])
        break
      }
    }
  }

  const removeItemFromBatch = (item: UserNft, dir: string) => {
    switch (dir) {
      case "list": {
        setlistItemsBatch((prev) => prev.filter((i) => i.tokenId !== item.tokenId || i.collection !== item.collection))
        break
      }
      case "delist": {
        setdelistItemsBatch((prev) => prev.filter((i) => i.tokenId !== item.tokenId || i.collection !== item.collection))
        break
      }
      case "approve": {
        setApproveColsBatch((prev) => prev.filter((i) => i !== item.collection))
        break
      }
    }
  }

  const isInBatch = (item: UserNft, dir: string) => {
    switch (dir) {
      case "list": {
        return listItemsBatch.some((b) => b.tokenId === item.tokenId && b.collection === item.collection)
        break
      }
      case "approve": {
        return approveColsBatch.some((b) => b === item.collection)
        break
      }
      case "delist": {
        return delistItemsBatch.some((b) => b.tokenId === item.tokenId && b.collection === item.collection)
        break
      }
    }
  }

  const closeListCard = () => {
    setListPage(false)
  }

  return (
    <div className=" flex flex-col gap-2 w-full relative">
      <div className="flex lg:gap-4  w-full relative">
        <div
          className={
            "flex flex-1 flex-row w-full lg:w-fit  lg:relative absolute transition-all duration-200 lg:translate-y-0 -translate-y-full lg:scale-y-100  z-10 " +
            (showColsCard ? " scale-y-100 translate-y-0 border-b border-(--accent)/50 " : " scale-y-0 ")
          }
        >
          <div className=" bg-(--bg-secondary) w-full lg:rounded-none! overflow-hidden   border-(--accent)/50 lg:border-r    ">
            <div className="flex flex-col lg:bg-(--accent)/20 h-full   ">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center  px-4 pt-4">
                  <h2 className="text-xl px-6 font-bold">
                    {address?.slice(0, 5)}...{address?.slice(-5)}
                  </h2>
                  <button onClick={() => copyToClipboard(address)} className="bg-transparent!  hover:opacity-75!">
                    <FiCopy className=" text-xl" />
                  </button>
                  <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank">
                    <FaExternalLinkAlt className="hover:opacity-75 hover:cursor-pointer text-[17px]" />
                  </a>
                </div>
                <button onClick={() => setShowColsCard(false)} className="bg-transparent! lg:hidden text-(--text-secondary)! p-4">
                  <FaTimes />
                </button>
              </div>

              <div className="flex gap-4 mt-2 border-b border-(--accent)/30  px-4">
                <button
                  onClick={() => setBidsOrItems("items")}
                  className={"flex grow items-center justify-center gap-2 bg-transparent! p-2 " + (bidsOrItems == "items" ? " text-(--accent)! border-b" : "text-(--text)/80!")}
                >
                  <HiOutlineCollection />
                  <span>Owned </span>
                </button>
                <button
                  onClick={() => setBidsOrItems("bids")}
                  className={"flex grow justify-center items-center gap-2 bg-transparent! p-2 " + (bidsOrItems == "bids" ? " text-(--accent)! border-b" : "text-(--text)/80!")}
                >
                  <HiOutlineCollection />
                  <span>Biddded </span>
                </button>
              </div>
              <div className="flex flex-col gap-3 px-4 ">
                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-3 card p-2 rounded-xl w-full border-(--accent)/50 border">
                    <FaSearch className="opacity-50" />
                    <input type="text" className="bg-transparent!" placeholder="Search collection" />
                  </label>
                </div>
                <div className="flex flex-col gap-2 pb-4">
                  <div className="flex  px-4">
                    <span className="flex-1 text-left">Name</span>
                    <span className="flex-1 text-center">Floor</span>
                    <span className="flex-1 text-right">Listed</span>
                  </div>
                  <div>
                    <div className="flex flex-col justify-end w-full h-full">
                      <div
                        onClick={() => setCollectionSelected("")}
                        className={
                          "card hover:cursor-pointer rounded border border-(--accent)/50 flex justify-between px-4 py-2 " +
                          (collectionSelected == "" ? " bg-(--accent)/80! text-(--bg-secondary)!" : " ")
                        }
                      >
                        <div className="flex flex-1 text-left items-center gap-2">
                          <span className="font-bold text-xs">All collections</span>
                        </div>
                        <div className="flex-1 text-center"></div>
                        <div className="flex flex-1 justify-end items-center gap-1 font-bold opacity-75">
                          <div>
                            <span>{userListings.length ? userListings.length : "-"}</span>
                            <span>/</span>
                            <span>{items.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {collections.map((col: any) => {
                    const colItems = items.filter((item) => String(item.collection).toLowerCase() == String(col.collection).toLowerCase())
                    const colListings = listings.filter((l) => l.collection == col.collection)
                    return (
                      <div
                        key={col.collection}
                        className={"card rounded border hover:cursor-pointer border-(--accent)/50" + (collectionSelected == col.collection ? " bg-(--accent)/80! text-(--bg-secondary)!" : " ")}
                        onClick={() => setCollectionSelected(col.collection)}
                      >
                        <CollectionLabel key={col.collection} collection={{ collection: col.collection, colItems: colItems, colListings: colListings }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-2 flex-col py-3 lg:pr-4 p-4 ">
          <div className="w-full flex items-center gap-2 text-start text-2xl font-bold justify-between mb-2">
            <div className="flex gap-4 items-center">
              <h2>{collectionSelected.length > 0 ? colName : "All collections"}</h2>

              {collectionSelected.length > 0 && (
                <div className=" flex gap-2 items-center">
                  <button onClick={() => copyToClipboard(collectionSelected)} className="bg-transparent! hover:opacity-75!">
                    <FiCopy className=" text-xl" />
                  </button>
                  <a href={`https://sepolia.etherscan.io/token/${collectionSelected}`} target="_blank">
                    <FaExternalLinkAlt className="hover:opacity-75 hover:cursor-pointer text-[17px]" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3 items-center">
              <button onClick={() => setShowColsCard(!showColsCard)} className=" lg:hidden text-(--secondary)! bg-transparent!">
                <HiOutlineCollection className="" />
              </button>
              <button onClick={() => setHistoryPage(true)} className={"flex bg-transparent! text-(--text-secondary)! items-center gap-2 rounded p-2 "}>
                <FaHistory />
              </button>
            </div>
          </div>
          <div className=" w-full flex gap-2 border-b border-(--accent)/30 mb-2">
            <button
              onClick={() => setCollectionView("inventory")}
              className={"flex items-center gap-2 bg-transparent! border-b p-2 " + (collectionView == "inventory" ? " text-(--accent)! " : "text-(--text)/80! border-transparent!")}
            >
              <HiOutlineCollection />
              <span>Inventory</span>
            </button>
            <button
              onClick={() => setCollectionView("colBids")}
              className={"flex items-center gap-2 bg-transparent! border-b p-2 " + (collectionView == "colBids" ? " text-(--accent)! " : "text-(--text)/80! border-transparent!")}
            >
              <FaGavel />
              <span>Collection bids</span>
            </button>
            <button
              onClick={() => setCollectionView("tokenBids")}
              className={"flex items-center gap-2 bg-transparent! border-b p-2 " + (collectionView == "tokenBids" ? " text-(--accent)! " : "text-(--text)/80! border-transparent!")}
            >
              <FaGavel />
              <span>Token bids</span>
            </button>
          </div>

          {collectionView == "inventory" && (
            <div>
              <div className="w-full py-2 flex gap-2">
                <button
                  onClick={handleList}
                  className={
                    "rounded flex gap-3 py-1 px-10  border border-(--accent)  " +
                    (listItemsBatch.filter((i) => !i.listed).length > 0 ? " bg-(--accent)! text-(--bg-secondary)!" : " bg-transparent! text-(--accent)!")
                  }
                  disabled={listItemsBatch.length <= 0}
                >
                  <span>List</span> <span>{listItemsBatch.length}</span>
                </button>
                <button
                  onClick={handleDelist}
                  className={
                    "rounded flex gap-3 py-1 px-10  border border-(--accent)  " + (delistItemsBatch.length > 0 ? " bg-(--accent)! text-(--bg-secondary)!" : " bg-transparent! text-(--accent)!")
                  }
                >
                  <span>Delist</span> <span>{delistItemsBatch.length}</span>
                </button>
                {!allApproved && (
                  <button
                    onClick={() => approveCollection(approveColsBatch[0])}
                    className={
                      "rounded flex gap-3 py-1 px-10  border border-(--accent)  " + (approveColsBatch.length > 0 ? " bg-(--accent)! text-(--bg-secondary)!" : " bg-transparent! text-(--accent)!")
                    }
                    disabled={approveColsBatch.length <= 0}
                  >
                    <span>Approve</span> <span>{approveColsBatch.length}</span>
                  </button>
                )}
              </div>
              {items.length == 0 && !isLoading && !address && (
                <div className="w-full flex items-center h-full justify-center">
                  <div>
                    <ConnectWallet textMsg="CONNECT WALLET" />
                  </div>
                </div>
              )}
              {items.length == 0 && !isLoading && address && (
                <div className=" flex flex-col items-center justify-center gap-2 p-4">
                  <FaInbox className="text-3xl" />
                  <p>You have no tiems </p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
                {status == "loading" && items.length == 0 && isLoading && (
                  <div className="w-full relative flex justify-center  aspect-9/12  px-4  animate-pulse">
                    <div className="absolute w-full h-full bg-(--accent) opacity-50 rounded"></div>
                  </div>
                )}

                {items.length > 0 &&
                  sortedUserItems.map((i, index) => {
                    const key = i.tokenId.toString()
                    return (
                      <AnimatePresence key={i.tokenId.toString() + i.collection}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.1, delay: index * 0.1 }}
                          onClick={() => {
                            if (!isInBatch(i, "list") && !isInBatch(i, "approve") && !isInBatch(i, "delist")) {
                              if (approvalMap[String(i.collection).toLowerCase()]) {
                                if (i.listed) {
                                  addItemToBatch(i, "delist")
                                } else {
                                  addItemToBatch(i, "list")
                                }
                              } else {
                                addItemToBatch(i, "approve")
                              }
                            } else {
                              if (isInBatch(i, "approve")) {
                                removeItemFromBatch(i, "approve")
                              } else if (isInBatch(i, "list")) {
                                removeItemFromBatch(i, "list")
                              } else if (isInBatch(i, "delist")) {
                                removeItemFromBatch(i, "delist")
                              }
                            }
                          }}
                          className={
                            " aspect-9/12 min-w-25 relative border-2  hover:border-(--accent) hover:cursor-pointer bg-(--accent) rounded  overflow-hidden text-white " +
                            (isInBatch(i, "list") ? " border-(--accent)! " : " border-(--bg-secondary) ") +
                            (isInBatch(i, "approve") ? " border-white! " : " border-(--bg-secondary)") +
                            (isInBatch(i, "delist") ? " border-[#c19137]! " : " border-(--bg-secondary) ")
                          }
                        >
                          {(isInBatch(i, "list") || isInBatch(i, "delist") || isInBatch(i, "approve")) && (
                            <div
                              className={
                                "  bg-(--bg-secondary)  rounded text-xs border absolute left-4 top-3 " +
                                (isInBatch(i, "list") ? " border-(--accent)! text-(--accent)! " : " border-(--bg-secondary) ") +
                                (isInBatch(i, "approve") ? " border-white! text-white!" : " border-(--bg-secondary)") +
                                (isInBatch(i, "delist") ? " border-[#c19137] text-[#c19137]! " : " border-(--bg-secondary) ")
                              }
                            >
                              <span className="p-2 ">
                                {isInBatch(i, "list") && "LIST"}
                                {isInBatch(i, "delist") && "DELIST"}
                                {isInBatch(i, "approve") && "APPROVE"}
                              </span>
                            </div>
                          )}
                          <NFTCard token={i} />
                        </motion.div>
                      </AnimatePresence>
                    )
                  })}
              </div>
            </div>
          )}
          {collectionView == "colBids" && (
            <div>
              <CollectionBids allBids={false} collectionBids={collectionBids} />
            </div>
          )}
          {collectionView == "tokenBids" && (
            <div>
              <TokenBids
                collectionSelected={collectionSelected}
                cancelTokenBid={cancelTokenBid}
                cancelTokenBidBatch={cancelTokenBidBatch}
                cancelTokenBidItemsBatch={cancelTokenBidItemsBatch}
                setCancelTokenBidItemsBatch={setCancelTokenBidItemsBatch}
                tokenBids={tokenBids}
              />
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {listPage && (
          <motion.div
            key={"unique"}
            initial={{ translateY: "-100%" }}
            animate={{ translateY: 0 }}
            exit={{ translateY: "-100%" }}
            transition={{ duration: 0.3 }}
            className=" absolute card  h-full overflow-y-scroll  w-full   left-0 top-0 z-10  "
          >
            <div className="flex flex-col  w-full ">
              <div className="p-4 flex w-full justify-between card  text-2xl">
                <div className="flex items-center gap-3">
                  <MdOutlineLocalOffer className="text-3xl" />
                  <span className="font-bold">List items</span>
                </div>
                <button onClick={closeListCard} className="bg-transparent!">
                  <FaTimes className="opacity-75" />
                </button>
              </div>
              <div className="flex w-full  border-b border-(--accent)/50 card ">
                <ListCard items={listItemsBatch} collections={collections} listings={listings} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {historyPage && (
          <motion.div
            key={"unique"}
            initial={{ translateY: "-100%" }}
            animate={{ translateY: 0 }}
            exit={{ translateY: "-100%" }}
            transition={{ duration: 0.3 }}
            className=" absolute h-full overflow-auto card  w-full   left-0 top-0  z-10"
          >
            <div className="px-4 flex justify-between w-full card  relative text-2xl">
              <div className="flex justify-between py-4">
                <div className="flex text-xl items-center gap-3">
                  <FiActivity />

                  <h2 className="font-bold ">Activity</h2>
                </div>
              </div>
              <button onClick={() => setHistoryPage(false)} className="bg-transparent!">
                <FaTimes className="opacity-75" />
              </button>
            </div>
            <History />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
