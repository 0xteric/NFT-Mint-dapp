import { useEffect, useState } from "react"
import { FaEthereum, FaInbox } from "react-icons/fa"
import { useTx } from "@/app/context/TxContext"
import { usePublicClient } from "wagmi"

export default function TokenBids({ tokenBids, cancelTokenBidItemsBatch, setCancelTokenBidItemsBatch, cancelTokenBid, cancelTokenBidBatch }: any) {
  const [sortedBids, setSortedBids] = useState(tokenBids)
  const { addTx, removeTx, updateTx } = useTx()
  const publicClient = usePublicClient()

  useEffect(() => {
    if (tokenBids) {
      setSortedBids(tokenBids.sort((a: any, b: any) => Number(b.price) - Number(a.price)))
    }
  }, [tokenBids])

  useEffect(() => {
    console.log(cancelTokenBidItemsBatch)
  }, [cancelTokenBidItemsBatch.length])

  const addItemToBatch = (i: any) => {
    setCancelTokenBidItemsBatch((prev: any) => [...prev, i])
  }

  const removeItemFromBatch = (item: any) => {
    setCancelTokenBidItemsBatch((prev: any) => prev.filter((i: any) => i.tokenId !== item.tokenId || i.collection !== item.collection))
  }

  const isInBatch = (item: any) => {
    return cancelTokenBidItemsBatch.some((b: any) => b.tokenId === item.tokenId && b.collection === item.collection)
  }

  const handleCancelBids = async () => {
    if (!cancelTokenBidItemsBatch.length) return
    let hash: any
    try {
      if (cancelTokenBidItemsBatch.length > 1) {
        hash = await cancelTokenBidBatch()
        addTx({ hash, status: "loading", label: "Cancelling token bids" })
      } else {
        hash = await cancelTokenBid()
        addTx({ hash, status: "loading", label: "Cancelling token bids" })
      }
      await publicClient?.waitForTransactionReceipt({ hash })
      updateTx(hash, { status: "success", label: "Cancelled!" })
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    } catch (e) {
      updateTx(hash, { status: "success", label: "Cancelling error!" })
      console.log(e)
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    }
  }
  return (
    <div className="w-full flex">
      <div className="w-full flex flex-col border-collapse text-left card p-2 rounded ">
        <div className="w-full justify-end flex">
          <button
            disabled={!cancelTokenBidItemsBatch.length}
            className={"p-2 px-4 rounded gap-2 flex items-center border! border-(--accent)! " + (!cancelTokenBidItemsBatch.length ? " bg-transparent! text-(--accent)!" : "")}
          >
            <span>Cancel</span>
            <span>{cancelTokenBidItemsBatch.length}</span>
            <span>bids</span>
          </button>
        </div>
        <div>
          <div className="border-b flex  border-(--accent)/60 p-2">
            <div className="flex flex-1 gap-3 items-center">
              <span>Price</span>
              <div className="flex gap-2">
                <span>(</span>
                <FaEthereum />
                <span>)</span>
              </div>
            </div>
            <span className="flex-1 border-l px-4 border-(--text-secondary)/30 p-2">Token id</span>
          </div>
        </div>

        <div>
          {sortedBids.map((c: any, index: number) => {
            return (
              <div key={index} className="border-b flex items-center border-(--accent)/60 relative  ">
                <span className="flex-1 p-2 relative z-10">
                  <div className="flex gap-2 items-center">
                    <span>{Number(c.price) / 1e18}</span>
                    <FaEthereum />
                  </div>
                </span>
                <div className="flex-1 p-2 relative z-10">#{c.tokenId}</div>
                <div>
                  <button
                    onClick={() => {
                      if (isInBatch(c)) {
                        removeItemFromBatch(c)
                      } else {
                        addItemToBatch(c)
                      }
                    }}
                    className="bg-transparent! text-(--text-secondary)!"
                  >
                    {isInBatch(c) ? "- CANCEL" : "+ CANCEL"}
                  </button>
                </div>
              </div>
            )
          })}
          {!tokenBids.length && (
            <div className=" flex flex-col items-center justify-center gap-2 p-4">
              <FaInbox className="text-3xl" />
              <p>No token bids found </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
