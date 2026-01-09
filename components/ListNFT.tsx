"use client"

import { useState, useEffect } from "react"
import { Address, erc721Abi } from "viem"
import { useAccount, useReadContract, useWriteContract, useReadContracts } from "wagmi"
import { CORE_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/constants"
import { useList, useMarketplaceListingsIndex, useUserTokens } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import ConnectWallet from "./ConnectWallet"
import { FaSearch } from "react-icons/fa"
import { ListedNFTSProps, TxState, UserNft } from "@/lib/constants"
import { FiCopy } from "react-icons/fi"
import { FaExternalLinkAlt, FaHistory, FaTimes } from "react-icons/fa"
import { HiOutlineCollection } from "react-icons/hi"
import { FaInbox, FaGavel } from "react-icons/fa6"
import { NFTCard } from "./NFTCard"
import { CollectionLabel } from "./CollectionLabel"
import { useTx } from "@/app/context/TxContext"
import { ListCard } from "./ListCard"
import { MdOutlineLocalOffer } from "react-icons/md"

export default function ListNftWithApproval({ userListings = [], sortBy, sortDir, collections = [], listings }: ListedNFTSProps) {
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")
  const [items, setUserItems] = useState<UserNft[]>([])
  const [collectionSelected, setCollectionSelected] = useState<Address | any>("")
  const [bidsOrItems, setBidsOrItems] = useState<"bids" | "items">("items")
  const [collectionView, setCollectionView] = useState<"inventory" | "colBids" | "tokenBids" | "history">("inventory")
  const [listPage, setListPage] = useState<boolean>(false)
  const [listItemsBatch, setlistItemsBatch] = useState<UserNft[]>([])
  const [approveColsBatch, setApproveColsBatch] = useState<Address[]>([])

  const { addTx, updateTx, removeTx } = useTx()
  const { address }: any = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { publicClient } = useList()
  const collectionsReady = Boolean(collections?.length)
  const batchCollections = Array.from(new Set(items.map((i) => i.collection)))

  const { data: userTokensData, isLoading = true } = useUserTokens(address, collections, collectionsReady)
  const { data: colName } = useReadContract({
    address: collectionSelected,
    abi: erc721Abi,
    functionName: "name",
  })
  useEffect(() => {
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
    setApproveColsBatch([])
    setStatus("idle")
  }, [isLoading])

  const setTokenProp = <K extends keyof UserNft>(id: bigint, prop: K, value: UserNft[K] | null) => {
    setUserItems((prev: any) => prev.map((item: any) => (item.id === id ? { ...item, [prop]: value } : item)))
  }

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
      const { data: name } = useReadContract({
        address: collection,
        abi: erc721Abi,
        functionName: "name",
      })
      return name
    } catch (e) {
      console.log(e)
      return "name"
    }
  }

  const sortedUserItems = sortByField(
    items,
    (i) => i.tokenId,
    (i) => i.price
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
    }
  }

  const removeItemFromBatch = (item: UserNft, dir: string) => {
    switch (dir) {
      case "list": {
        setlistItemsBatch((prev) => prev.filter((i) => i.tokenId !== item.tokenId || i.collection !== item.collection))
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
    }
  }

  const closeListCard = () => {
    setListPage(false)
  }

  return (
    <div className=" flex flex-col gap-2 w-full relative">
      {!address && (
        <div className="w-full flex justify-center">
          <div className="w-50">
            <ConnectWallet textMsg="CONNECT WALLET" />
          </div>
        </div>
      )}
      <div className="flex gap-4 w-full">
        <div className="flex flex-col border-r border-(--accent)/30 p-4">
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-bold">
              {address?.slice(0, 5)}...{address?.slice(-5)}
            </h2>
            <button onClick={() => copyToClipboard(address)} className="bg-transparent! hover:opacity-75!">
              <FiCopy className=" text-xl" />
            </button>
            <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank">
              <FaExternalLinkAlt className="hover:opacity-75 hover:cursor-pointer text-[17px]" />
            </a>
          </div>
          <div className="flex gap-4 mt-2 border-b border-(--accent)/30">
            <button onClick={() => setBidsOrItems("items")} className={"flex items-center gap-2 bg-transparent! p-2 " + (bidsOrItems == "items" ? " text-(--accent)! border-b" : "text-(--text)/80!")}>
              <HiOutlineCollection />
              <span>Owned collections</span>
            </button>
            <button onClick={() => setBidsOrItems("bids")} className={"flex items-center gap-2 bg-transparent! p-2 " + (bidsOrItems == "bids" ? " text-(--accent)! border-b" : "text-(--text)/80!")}>
              <HiOutlineCollection />
              <span>Biddded collections</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 py-2">
              <label className="flex items-center gap-3 card p-2 rounded-xl w-full border-(--accent)/50 border">
                <FaSearch className="opacity-50" />
                <input type="text" className="bg-transparent!" placeholder="Search collection" />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between px-4">
                <span>Name</span>
                <span>Floor</span>
                <span>Listed</span>
              </div>
              <div>
                <div className="flex flex-col justify-end w-full h-full">
                  <div
                    onClick={() => setCollectionSelected("")}
                    className={
                      "card hover:cursor-pointer rounded border border-(--accent)/50 flex justify-between px-4 py-2 " + (collectionSelected == "" ? " bg-(--accent)/80! text-(--bg-secondary)!" : " ")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">All collections</span>
                    </div>
                    <div className="flex gap-1 font-bold opacity-75">
                      <span>{userListings.length ? userListings.length : "-"}</span>
                      <span>/</span>
                      <span>{items.length}</span>
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
        <div className="flex flex-col py-3 pr-4 grow">
          <div className="w-full flex items-center gap-2 text-start text-2xl font-bold mb-2">
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
            <button
              onClick={() => setCollectionView("history")}
              className={"flex items-center gap-2 bg-transparent! border-b p-2 " + (collectionView == "history" ? " text-(--accent)! " : "text-(--text)/80! border-transparent!")}
            >
              <FaHistory />
              <span>History</span>
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
                <button className="rounded py-1 px-10  border border-(--accent) bg-transparent! text-(--accent)!">Delist</button>
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
              {items.length == 0 && !isLoading && (
                <div className=" flex flex-col items-center justify-center gap-2 p-4">
                  <FaInbox className="text-3xl" />
                  <p>You have no tiems </p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
                {status == "loading" && (
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
                            if (!isInBatch(i, "list") && !isInBatch(i, "approve")) {
                              if (approvalMap[String(i.collection).toLowerCase()]) {
                                addItemToBatch(i, "list")
                              } else {
                                addItemToBatch(i, "approve")
                              }
                            } else {
                              if (isInBatch(i, "approve")) {
                                removeItemFromBatch(i, "approve")
                              } else {
                                removeItemFromBatch(i, "list")
                              }
                            }
                          }}
                          className={
                            " aspect-9/12 min-w-25 relative border-2  hover:border-(--accent) hover:cursor-pointer bg-(--accent) rounded  overflow-hidden text-white " +
                            (isInBatch(i, "list") ? " border-(--accent)! " : " border-(--bg-secondary) ") +
                            (isInBatch(i, "approve") ? " border-white!" : " border-(--bg-secondary)")
                          }
                        >
                          <NFTCard token={i} />
                        </motion.div>
                      </AnimatePresence>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {listPage && (
          <motion.div
            key={"unique"}
            initial={{ translateY: "100%" }}
            animate={{ translateY: 0 }}
            exit={{ translateY: "100%" }}
            transition={{ duration: 0.3 }}
            className=" absolute h-full w-full card left-0 top-0 overflow-y-scroll "
          >
            <div className="p-4 flex justify-between overflow-y-visible relative text-2xl">
              <div className="flex items-center gap-3">
                <MdOutlineLocalOffer className="text-3xl" />
                <span className="font-bold">List items</span>
              </div>
              <button onClick={closeListCard} className="bg-transparent!">
                <FaTimes className="opacity-75" />
              </button>
            </div>
            <div className="flex w-full ">
              <ListCard items={listItemsBatch} collections={collections} listings={listings} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
