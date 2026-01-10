import { motion } from "framer-motion"
import { FaGavel, FaTimes, FaTrash, FaEthereum } from "react-icons/fa"
import { RiNftFill } from "react-icons/ri"
import { ListedNft } from "@/lib/constants"
import { useBidToken, useBidTokenBatch } from "./Contract"
import { useTx } from "@/app/context/TxContext"
import { useMarketplace } from "@/app/context/MarketplaceContext"
import { useState } from "react"

export function BidCard({ bidItemsBatch = [], collections, names, removeItemFromBatch, collectionSelected, setBidCard, setBidBatch }: any) {
  const [priceAll, setPriceAll] = useState<any>()

  const { bidToken } = useBidToken()
  const { bidTokenBatch, publicClient } = useBidTokenBatch()
  const { addTx, removeTx, updateTx } = useTx()
  const { triggerBidsRefresh } = useMarketplace()

  const handleBid = async () => {
    let hash: any = 0
    try {
      if (bidItemsBatch.length > 1) {
        const value = bidItemsBatch.reduce((value: bigint, i: ListedNft) => value + BigInt(Number(i.priceEth) * 1e18), BigInt(0))
        const tokenIds = bidItemsBatch.map((i: ListedNft) => i.tokenId)
        const prices = bidItemsBatch.map((i: ListedNft) => BigInt(Number(i.priceEth) * 1e18))
        hash = await bidTokenBatch(collectionSelected, tokenIds, prices, value)
        addTx({ hash, status: "loading", label: "Biding items" })
      } else {
        hash = await bidToken(collectionSelected, bidItemsBatch[0].tokenId, bidItemsBatch[0].price)
        addTx({ hash, status: "loading", label: "Biding item" })
      }

      await publicClient?.waitForTransactionReceipt({ hash })
      updateTx(hash, { status: "success", label: bidItemsBatch.length > 1 ? "Bids placed!" : "Bid placed!" })
      triggerBidsRefresh()
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    } catch (e) {
      updateTx(hash, { status: "error", label: "Biding error!" })
      console.log(e)
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    }
  }

  const updateItemPrice = (id: bigint, collection: string, value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return

    setBidBatch((prev: ListedNft[]) => prev.map((item: ListedNft) => (item.tokenId === id && item.collection.toLowerCase() === collection.toLowerCase() ? { ...item, priceEth: value } : item)))
  }

  const updateItemsPrices = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return
    setPriceAll(value)
    setBidBatch((prev: ListedNft[]) =>
      prev.map((item: ListedNft) => ({
        ...item,
        priceEth: value,
      }))
    )
  }

  return (
    <motion.div
      key={"unique"}
      initial={{ translateY: "-100%" }}
      animate={{ translateY: 0 }}
      exit={{ translateY: "-100%" }}
      transition={{ duration: 0.3 }}
      className=" absolute h-full w-full card left-0 top-0 overflow-y-scroll  "
    >
      <div className="p-4 flex justify-between overflow-y-visible relative text-2xl">
        <div className="flex items-center gap-3">
          <FaGavel className="text-3xl" />
          <span className="font-bold">Bid items</span>
        </div>
        <button onClick={() => setBidCard(false)} className="bg-transparent!">
          <FaTimes className="opacity-75" />
        </button>
      </div>
      <div className="flex flex-col w-full ">
        <div className="flex w-full justify-end  px-4">
          <div className=" flex gap-2 items-center">
            <span>Set All to: </span>
            <input
              type="text"
              inputMode="decimal"
              value={priceAll ?? ""}
              onChange={(e) => updateItemsPrices(e.target.value)}
              className="text-sm rounded w-[111] border border-(--accent)/30 p-2 "
              placeholder="Price"
            />
          </div>
        </div>
        <div className="flex justify-between p-2 border-b border-(--accent)/30  items-center">
          <div className="flex-2 flex p-2 ">
            <span>Token</span>
          </div>
          <div className="flex-1 flex py-2 ">
            <span>Listed price</span>
          </div>
          <div className="flex-1 flex py-2 px-4">
            <span>Offer price</span>
          </div>
          <div className="flex-[0.1] ">
            <span></span>
          </div>
        </div>
        {bidItemsBatch.map((l: any) => {
          return (
            <div key={l.id} className="flex justify-between w-full items-center py-2 px-4 border-b border-(--accent)/30">
              <div className="flex flex-2 items-center gap-4">
                <RiNftFill className="text-2xl" />
                <div className="flex  flex-col items-start">
                  <span>#{l.tokenId}</span>
                  <span>{names ? names[collections.findIndex((col: any) => String(col.collection).toLowerCase() == collectionSelected.toLowerCase())]?.result : "-"}</span>
                </div>
              </div>

              <div className="flex flex-1 items-center gap-2">
                <span>{Number(l.price) / 1e18}</span>
                <FaEthereum />
              </div>

              <div className="flex flex-1 items-center gap-2">
                <div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={l.priceEth ?? ""}
                    onChange={(e) => updateItemPrice(l.tokenId, l.collection, e.target.value)}
                    className="rounded flex-1 p-2  text-sm"
                    placeholder="Price"
                  />
                </div>
              </div>

              <button onClick={() => removeItemFromBatch(l, "bid")} className="bg-transparent! flex-[0.1]  text-(--text-secondary)!">
                <FaTrash />
              </button>
            </div>
          )
        })}
        <div className="p-4 flex items-center w-full justify-between border-b border-(--accent)/30">
          <span className="font-bold text-sm">TOTAL BALANCE NEEDED: </span>
          <div className="flex gap-2 items-center text-xl">
            <span>
              {bidItemsBatch.reduce((acc: number, l: ListedNft) => {
                return Number(acc) + (Number(l.priceEth) ? Number(l.priceEth) : 0)
              }, 0)}
            </span>
            <FaEthereum />
          </div>
        </div>
        <div className="flex justify-end p-4 border-b border-(--accent)/50">
          <button onClick={handleBid} disabled={!bidItemsBatch.length} className="rounded flex items-center py-2 px-6 gap-3">
            <span>BID</span>
            <span>{bidItemsBatch.length}</span>
            <span>ITEMS</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
