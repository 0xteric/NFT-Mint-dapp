import { motion } from "framer-motion"
import { FaGavel, FaTimes, FaEthereum } from "react-icons/fa"
import { useBidCollection } from "./Contract"
import { useTx } from "@/app/context/TxContext"
import { useMarketplace } from "@/app/context/MarketplaceContext"
import { useState } from "react"
import { usePublicClient } from "wagmi"

export function ColBidCard({ floor = 0, collectionSelected, setColBidCard }: any) {
  const [price, setPrice] = useState<number | string>("")
  const [quantity, setQuantity] = useState<number | string>("")

  const publicClient = usePublicClient()
  const { bidCollection } = useBidCollection()
  const { addTx, removeTx, updateTx } = useTx()
  const { triggerBidsRefresh } = useMarketplace()

  const handleBid = async () => {
    if (!price || !quantity) return
    let hash: any = 0
    const _price: bigint = BigInt(Number(price) * 1e18)
    try {
      console.log(collectionSelected, _price, Number(quantity))
      hash = await bidCollection(collectionSelected, _price, Number(quantity))
      addTx({ hash, status: "loading", label: "Biding collection" })

      await publicClient?.waitForTransactionReceipt({ hash })
      updateTx(hash, { status: "success" })
      triggerBidsRefresh()
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

  const updateItemPrice = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return

    setPrice(value)
  }

  return (
    <motion.div
      key={"unique"}
      initial={{ translateY: "-100%" }}
      animate={{ translateY: 0 }}
      exit={{ translateY: "-100%" }}
      transition={{ duration: 0.3 }}
      className=" absolute h-fit w-full card left-0 top-0 overflow-y-scroll "
    >
      <div className="p-4 flex justify-between overflow-y-visible relative text-2xl">
        <div className="flex items-center gap-3">
          <FaGavel className="text-3xl" />
          <span className="font-bold">Bid collection</span>
        </div>
        <button onClick={() => setColBidCard(false)} className="bg-transparent!">
          <FaTimes className="opacity-75" />
        </button>
      </div>
      <div className="flex flex-col w-full ">
        <div className="flex justify-between p-2 border-b border-(--accent)/30  items-center">
          <div className="flex-2 flex p-2 ">
            <span>Floor</span>
          </div>
          <div className="flex-1 flex py-2 ">
            <span>Bid price</span>
          </div>
          <div className="flex-1 flex py-2 ">
            <span>Quantity</span>
          </div>
        </div>

        <div className="flex justify-between w-full items-center py-2 px-4 border-b border-(--accent)/30">
          <div className="flex flex-2 items-center gap-4">
            <span className="text-2xl">{Number(floor()) / 1e18}</span>
            <FaEthereum className="text-2xl" />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <div>
              <input type="text" inputMode="decimal" value={price ?? ""} onChange={(e) => updateItemPrice(e.target.value)} className="rounded flex-1 p-2  text-sm" placeholder="Price" />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2">
            <div>
              <input
                type="number"
                inputMode="decimal"
                value={quantity ?? ""}
                onChange={(e) => setQuantity(Number(e.target.value).toFixed(0))}
                className="rounded flex-1 p-2  text-sm"
                placeholder="Quantity"
              />
            </div>
          </div>
        </div>
        <div className="p-4 flex items-center w-full justify-between border-b border-(--accent)/30">
          <span className="font-bold text-sm">TOTAL BALANCE NEEDED: </span>
          <div className="flex gap-2 items-center text-xl">
            <span>{Number(quantity) * Number(price)}</span>
            <FaEthereum />
          </div>
        </div>
        <div className="flex justify-end p-4">
          <button onClick={handleBid} disabled={false} className="rounded flex items-center py-2 px-6 gap-3">
            <span>PLACE</span>
            <span>BID</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
