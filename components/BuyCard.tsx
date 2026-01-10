import { motion } from "framer-motion"
import { FaGavel, FaTimes, FaTrash, FaEthereum } from "react-icons/fa"
import { RiNftFill } from "react-icons/ri"
import { ListedNft } from "@/lib/constants"
import { useBuy, useBuyBatch } from "./Contract"
import { useTx } from "@/app/context/TxContext"
import { useMarketplace } from "@/app/context/MarketplaceContext"
export function BuyCard({ buyItemsBatch, collections, names, removeItemFromBatch, collectionSelected, setBuyCard }: any) {
  const { buy } = useBuy()
  const { buyBatch, publicClient } = useBuyBatch()
  const { addTx, removeTx, updateTx } = useTx()
  const { triggerListingsRefresh, triggerBidsRefresh } = useMarketplace()

  const handleBuy = async () => {
    let hash: any = 0
    try {
      if (buyItemsBatch.length > 1) {
        const value = buyItemsBatch.reduce((value: bigint, i: ListedNft) => value + i.price, BigInt(0))
        const tokenIds = buyItemsBatch.map((i: ListedNft) => i.tokenId)
        hash = await buyBatch(collectionSelected, tokenIds, value)
        addTx({ hash, status: "loading", label: "Buying items" })
      } else {
        hash = await buy(collectionSelected, buyItemsBatch[0].tokenId, buyItemsBatch[0].price)
        addTx({ hash, status: "loading", label: "Buying item" })
      }

      await publicClient?.waitForTransactionReceipt({ hash })
      updateTx(hash, { status: "success" })
      triggerListingsRefresh()
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    } catch (e) {
      updateTx(hash, { status: "error" })
      console.log(e)
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    }
  }

  return (
    <motion.div
      key={"unique"}
      initial={{ translateY: "-100%" }}
      animate={{ translateY: 0 }}
      exit={{ translateY: "-100%" }}
      transition={{ duration: 0.3 }}
      className=" absolute h-full w-full card left-0 top-0 overflow-y-scroll "
    >
      <div className="p-4 flex justify-between overflow-y-visible relative text-2xl ">
        <div className="flex items-center gap-3">
          <FaGavel className="text-3xl" />
          <span className="font-bold">Buy items</span>
        </div>
        <button onClick={() => setBuyCard(false)} className="bg-transparent!">
          <FaTimes className="opacity-75" />
        </button>
      </div>
      <div className="flex flex-col w-full ">
        <div className="flex justify-between p-2 border-b border-(--accent)/30  items-center">
          <div className="flex-2 flex p-2 ">
            <span>Token</span>
          </div>
          <div className="flex-1 flex py-2 px-4">
            <span>Price</span>
          </div>
          <div className="flex-[0.1] ">
            <span></span>
          </div>
        </div>
        {buyItemsBatch.map((l: any) => {
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
              <button onClick={() => removeItemFromBatch(l, "buy")} className="bg-transparent! flex-[0.1]  text-(--text-secondary)!">
                <FaTrash />
              </button>
            </div>
          )
        })}
        <div className="p-4 flex items-center w-full justify-between border-b border-(--accent)/30">
          <span className="font-bold text-sm">TOTAL PRICE: </span>
          <div className="flex gap-2 items-center text-xl">
            <span>
              {buyItemsBatch.reduce((acc: number, l: ListedNft) => {
                return Number(acc) + Number(l.price)
              }, 0) / 1e18}
            </span>
            <FaEthereum />
          </div>
        </div>
        <div className="flex justify-end p-4 border-b border-(--accent)/50 ">
          <button onClick={handleBuy} disabled={!buyItemsBatch.length} className="rounded flex items-center py-2 px-6 gap-3">
            <span>BUY</span>
            <span>{buyItemsBatch.length}</span>
            <span>ITEMS</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
