"use client"

import { useState, useEffect, useRef } from "react"
import { Address, parseEther, erc721Abi } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { nftAbi } from "@/lib/abi"
import { MARKETPLACE_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS, CORE_CONTRACT_ADDRESS } from "@/lib/constants"
import { useList, useCancelList, useUserTokens } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import ConnectWallet from "./ConnectWallet"
import { FaSearch } from "react-icons/fa"
import { ListedNFTSProps, TxState, UserNft } from "@/lib/constants"
import { useQueryClient } from "@tanstack/react-query"
import { FiCopy } from "react-icons/fi"
import { FaExternalLinkAlt, FaHistory } from "react-icons/fa"
import { HiOutlineCollection } from "react-icons/hi"
import { TbHammer } from "react-icons/tb"
import { FaInbox } from "react-icons/fa6"
import { NFTCard } from "./NFTCard"

export default function ListNftWithApproval({ userListings = [], sortBy, sortDir, collections = [] }: ListedNFTSProps) {
  const [collection, setCollection] = useState<Address | "">(NFT_CONTRACT_ADDRESS)
  const [txMap, setTxMap] = useState<Record<string, TxState>>({})
  const [tokenId, setTokenId] = useState<bigint | "">("")
  const [price, setPrice] = useState<number | string>("")
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")
  const [items, setUserItems] = useState<UserNft[]>([])
  const [collectionSelected, setCollectionSelected] = useState<string>("")
  const [bidsOrItems, setBidsOrItems] = useState<"bids" | "items">("items")
  const [collectionView, setCollectionView] = useState<"inventory" | "colBids" | "tokenBids" | "history">("inventory")
  const [itemsBatch, setItemsBatch] = useState<UserNft[]>([])
  const loadingQueryRef = useRef(false)

  const queryClient = useQueryClient()
  const { address }: any = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { list, publicClient } = useList()
  const { cancelList } = useCancelList()
  const collectionsReady = Boolean(collections?.length)

  const { data: userTokensData, isLoading = true } = useUserTokens(address, collections, collectionsReady)

  useEffect(() => {
    console.log(collectionsReady, isLoading)

    if (!collectionsReady || isLoading || !userTokensData) return
    console.log("2 ", userTokensData.tokens)

    const listingsMap = new Map(userListings.map((l) => [l.tokenId.toString() + "-" + l.collection.toString(), l]))

    const userItems: UserNft[] = userTokensData.tokens.map((token: any) => {
      const listing = listingsMap.get(token.tokenId.toString() + "-" + token.collection.toString())
      const name: string = String(getNFTName(token.collection))

      return {
        id: token.tokenId,
        collection: token.collection,
        listed: Boolean(listing),
        price: listing?.price ?? BigInt(0),
        name,
        onBatch: false,
      }
    })

    setUserItems(userItems)
    setStatus("idle")
  }, [isLoading])

  function setTx(tokenId: bigint, patch: Partial<TxState>) {
    const key = tokenId.toString()

    setTxMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { txStatus: "idle", action: "none" }),
        ...patch,
      },
    }))
  }

  const setTokenProp = <K extends keyof UserNft>(id: bigint, prop: K, value: UserNft[K] | null) => {
    setUserItems((prev: any) => prev.map((item: any) => (item.id === id ? { ...item, [prop]: value } : item)))
  }

  const { data: isApproved, refetch } = useReadContract({
    address: collection || undefined,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: collection && address ? [address, CORE_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: Boolean(collection && address),
    },
  })

  const approveCollection = async (id: bigint) => {
    if (!collection) return
    setTx(id, { txStatus: "waiting", action: "approve" })

    try {
      const hash = await writeContractAsync({
        address: collection,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [CORE_CONTRACT_ADDRESS, true],
      })

      setTx(id, { txStatus: "loading", txHash: hash })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTx(id, { txStatus: "success" })

      setTimeout(async () => {
        await refetch()
        setTx(id, { txStatus: "idle", action: "none" })
      }, 3500)
    } catch (e) {
      setTx(id, { txStatus: "error" })
      setTimeout(() => {
        setTx(id, { txStatus: "idle", action: "none" })
      }, 3500)
    }
  }

  const handleList = async (e: any, id: bigint) => {
    if (!collection || tokenId === "" || Number(price) <= 0) return
    if (e.target.id == "input-price") return
    setTx(id, { txStatus: "waiting", action: "list" })
    try {
      const _price = parseEther(String(price))
      const hash = await list(Number(id), _price)
      setTx(id, { txStatus: "loading", txHash: hash })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTx(id, { txStatus: "success" })
      setTimeout(async () => {
        if (!loadingQueryRef.current) {
          loadingQueryRef.current = true

          await queryClient.invalidateQueries({ queryKey: ["marketplace-index"] })
          await queryClient.invalidateQueries({ queryKey: ["user-tokens"] })

          setTimeout(() => {
            loadingQueryRef.current = false
          }, 5000)
        }

        setTokenProp(id, "listed", true)
        setTokenProp(id, "price", _price)
        setTx(id, { txStatus: "idle", txHash: undefined, action: "none" })
        setTokenId("")
        setPrice("")
      }, 3500)
    } catch (e) {
      setTx(id, { txStatus: "error" })
      setTimeout(() => {
        setTx(id, { txStatus: "idle", txHash: undefined, action: "none" })
        setTokenId("")
        setPrice("")
      }, 3500)
    }
  }

  const handleDelist = async (id: bigint) => {
    if (!collection || tokenId === "") return
    setTx(id, { txStatus: "waiting" })
    try {
      const hash = await cancelList(collection, Number(tokenId))
      setTx(id, { txStatus: "loading", txHash: hash })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTx(id, { txStatus: "success", txHash: undefined })
      setTimeout(async () => {
        if (!loadingQueryRef.current) {
          loadingQueryRef.current = true

          await queryClient.invalidateQueries({ queryKey: ["marketplace-index"] })
          await queryClient.invalidateQueries({ queryKey: ["user-tokens", address] })

          setTimeout(() => {
            loadingQueryRef.current = false
          }, 5000)
        }
        setTx(id, { txStatus: "idle", txHash: undefined })
        setTokenProp(id, "listed", false)
        setTokenId("")
        setPrice("")
      }, 3500)
    } catch (e) {
      setTx(id, { txStatus: "error" })
      setTimeout(() => {
        setTx(id, { txStatus: "idle", txHash: undefined })
        setTokenId("")
        setPrice("")
      }, 3500)
    }
  }

  const handleBgClick = (e: any) => {
    if (e.target.id == "input-price") return
    if (e.target.id != "list-btn") {
      setTokenId("")
      setPrice("")
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
    (i) => i.id,
    (i) => i.price
  )

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
  }
  const addItemToBatch = (item: UserNft) => {
    setItemsBatch((prev) => [...prev, item])
  }

  const removeItemFromBatch = (item: UserNft) => {
    setItemsBatch((prev) => prev.filter((i) => i.id !== item.id || i.collection !== item.collection))
  }

  const isInBatch = (item: UserNft) => itemsBatch.some((b) => b.id === item.id && b.collection === item.collection)

  return (
    <div onClick={handleBgClick} className=" flex flex-col gap-2 w-full">
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
          <div className="flex items-center gap-2 py-2">
            <label className="flex items-center gap-3 card p-2 rounded w-full border-(--accent)/50 border">
              <FaSearch className="opacity-50" />
              <input type="text" className="bg-transparent!" placeholder="Search collection" />
            </label>
          </div>
        </div>
        <div className="flex flex-col py-3 pr-4 grow">
          <div className="w-full text-start text-2xl font-bold mb-2">
            <h2>{collectionSelected.length > 0 ? "" : "All collections"}</h2>
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
              <TbHammer />
              <span>Collection bids</span>
            </button>
            <button
              onClick={() => setCollectionView("tokenBids")}
              className={"flex items-center gap-2 bg-transparent! border-b p-2 " + (collectionView == "tokenBids" ? " text-(--accent)! " : "text-(--text)/80! border-transparent!")}
            >
              <TbHammer />
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
                <button className="rounded flex gap-3 py-1 px-10  border border-(--accent) bg-transparent! text-(--accent)!">
                  <span>List</span> <span>{itemsBatch.length}</span>
                </button>
                <button className="rounded py-1 px-10  border border-(--accent) bg-transparent! text-(--accent)!">Delist</button>
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
                    const key = i.id.toString()
                    const tx = txMap[key] ?? { txStatus: "idle" }

                    return (
                      <AnimatePresence key={i.id.toString() + i.collection}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.1, delay: index * 0.1 }}
                          onClick={() => {
                            if (!isInBatch(i)) {
                              addItemToBatch(i)
                            } else {
                              removeItemFromBatch(i)
                            }
                          }}
                          className={
                            " aspect-9/12 min-w-25 relative border-2  hover:border-(--accent) hover:cursor-pointer bg-(--accent) rounded  overflow-hidden text-white " +
                            (isInBatch(i) ? " border-(--accent)" : "border-(--bg-secondary)")
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
    </div>
  )
}
