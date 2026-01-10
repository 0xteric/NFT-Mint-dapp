import { CORE_CONTRACT_ADDRESS, UserNft } from "@/lib/constants"
import { useReadContracts, useAccount } from "wagmi"
import { Address, erc721Abi } from "viem"
import { RiNftFill } from "react-icons/ri"
import { MarketplaceCoreABI } from "@/lib/abi"
import { useEffect, useState } from "react"
import { FaEthereum, FaTrash } from "react-icons/fa"
import { useMarketplace } from "@/app/context/MarketplaceContext"
import { useList, useListBatch } from "./Contract"
import { useTx } from "@/app/context/TxContext"

export function ListCard({ items, collections, listings }: { items: UserNft[]; collections: any[]; listings: any[] }) {
  const [priceAll, setPriceAll] = useState<any>()
  const [listItems, setListItems] = useState<UserNft[]>(items)
  const [totalEstimated, setTotalEstimated] = useState<number>(0)
  const [totalRoyalties, setTotalRoyalties] = useState<number>(0)
  const [totalMarketplaceFee, setTotalMarketplaceFee] = useState<number>(0)
  const { info, triggerListingsRefresh } = useMarketplace()
  const { list, publicClient } = useList()
  const { listBatch } = useListBatch()
  const { addTx, removeTx, updateTx } = useTx()
  let prices = []

  const { data: names, isLoading = true } = useReadContracts({
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
    contracts: collections.map((col) => ({
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
    if (!colsData) return
    let _marketplaceFee = 0
    let _royaltyFee = 0

    setTotalEstimated(
      listItems.reduce((size: number, item: any) => {
        const colData: any = colsData[collections.findIndex((col: any) => String(col.collection).toLowerCase() == String(item.collection).toLowerCase())].result
        const royaltyFee = (Number(item.price) * Number(colData[2])) / 10000
        const marketplaceFee = (Number(item.price) * Number(info.marketplaceFee)) / 10000
        const addition = Number(item.price) - royaltyFee - marketplaceFee

        _marketplaceFee += marketplaceFee
        _royaltyFee += royaltyFee
        return size + addition
      }, 0)
    )
    setTotalMarketplaceFee(_marketplaceFee)
    setTotalRoyalties(_royaltyFee)
  }, [colsData, listItems])

  const handleList = async () => {
    if (!items.length || listItems.some((i) => !i.price)) return
    let hash: Address
    try {
      const collections = listItems.map((i) => i.collection)
      const tokenIds = listItems.map((i) => i.tokenId)
      const prices = listItems.map((i) => i.price)
      if (listItems.length > 1) {
        hash = await listBatch(collections, tokenIds, prices)
        addTx({ hash, status: "loading", label: "Listing batch" })
      } else {
        hash = await list(collections[0], tokenIds[0], prices[0])
        addTx({ hash, status: "loading", label: "Listing" })
      }

      await publicClient?.waitForTransactionReceipt({
        hash,
      })

      updateTx(hash, { status: "success" })
      triggerListingsRefresh()
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
    } catch (e) {
      updateTx(hash, { status: "error" })
      setTimeout(() => {
        removeTx(hash)
      }, 3500)
      console.log(e)
    }
  }

  const getFloor = (col: string) => {
    if (!listings || !listings.length) return false
    return listings.filter((l) => l.collection == col).sort((a, b) => Number(a.price) - Number(b.price))[0].price
  }

  const updateItemPrice = (id: bigint, collection: string, value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return

    const wei = value === "" || value === "." ? undefined : BigInt(Math.floor(Number(value) * 1e18))

    setListItems((prev) => prev.map((item) => (item.tokenId === id && item.collection.toLowerCase() === collection.toLowerCase() ? { ...item, priceEth: value, price: wei } : item)))
  }

  const updateItemsPrices = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return

    const wei = value === "" || value === "." ? undefined : BigInt(Math.floor(Number(value) * 1e18))

    setPriceAll(value)

    setListItems((prev) =>
      prev.map((item) => ({
        ...item,
        priceEth: value,
        price: wei,
      }))
    )
  }

  const removeListItem = (id: bigint, collection: Address) => {
    setListItems((prev) => prev.filter((item) => item.tokenId != id || item.collection != collection))
  }

  return (
    <div className="w-full  flex flex-col    ">
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
      <div className="flex  w-full justify-between px-6 font-bold border-b border-(--accent)/30 py-2">
        <div className=" flex flex-2 gap-2  items-center">
          <span>{items.length + " items"}</span>
        </div>
        <div className=" flex flex-1 gap-2 items-center">
          <span>Floor</span>
        </div>
        <div className=" flex flex-1 gap-2 items-center">
          <span>Royalty</span>
        </div>
        <div className=" flex flex-1 gap-2 items-center">
          <span>Price</span>
        </div>
        <div className=" flex flex-[0.2] gap-2 items-center"></div>
      </div>
      <div className="  flex flex-col  w-full   ">
        {listItems.map((i, index) => {
          const floor = getFloor(i.collection)
          const name: any = !isLoading && names?.length ? names[collections.findIndex((col: any) => String(col.collection).toLowerCase() == String(i.collection).toLowerCase())].result : "-"
          const colData: any =
            !isLoadingCore && colsData?.length ? colsData[collections.findIndex((col: any) => String(col.collection).toLowerCase() == String(i.collection).toLowerCase())].result : "-"
          prices.push(Number(i.price) / 1e18)
          return (
            <div className="flex items-center px-6 justify-between w-full p-2 border-b border-(--accent)/30" key={index}>
              <div className="flex flex-2 items-center gap-3">
                <RiNftFill className="text-xl" />
                <div className="flex flex-col items-start">
                  <span>#{i.tokenId}</span>
                  <span className="text-sm opacity-65">{name}</span>
                </div>
              </div>
              <div className="flex flex-1">{floor ? floor : "-"}</div>
              <div className="flex gap-2 items-center flex-1">
                <div className="flex gap-1 items-center max-w-auto">
                  <span>
                    {Number(colData ? colData[2] : "0") * Number(i.price)
                      ? String((Number(colData[2]) * Number(i.price)) / 1e18 / 10000).length > 6
                        ? ((Number(colData[2]) * Number(i.price)) / 1e18 / 10000).toFixed(4)
                        : (Number(colData[2]) * Number(i.price)) / 1e18 / 10000
                      : "-"}
                  </span>
                  <FaEthereum />
                </div>
                <div>({colData ? `${Number(colData[2]) / 100}%` : "-"})</div>
              </div>
              <div className="flex flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={i.priceEth ?? ""}
                  onChange={(e) => updateItemPrice(i.tokenId, i.collection, e.target.value)}
                  className="rounded flex-1 p-2 w-[150] text-sm"
                  placeholder="Price"
                />
              </div>
              <div className=" flex flex-[0.2] justify-center   gap-2 items-center">
                <button onClick={() => removeListItem(i.tokenId, i.collection)} className="p-2 bg-transparent!">
                  <FaTrash className="opacity-75" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="w-full  flex flex-col p-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl">Total estimated: </span>
              <div className="flex gap-2 items-center text-xl">
                <span>{totalEstimated ? totalEstimated / 1e18 : "-"}</span>
                <FaEthereum />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm opacity-55">
              <div className="flex items-center gap-2">
                <span className="font-bold ">Royalties: </span>
                <div className="flex gap-2 items-center">
                  <span>{totalRoyalties ? totalRoyalties / 1e18 : "-"}</span>
                  <span>({totalRoyalties ? ((totalRoyalties / (totalEstimated + totalMarketplaceFee + totalRoyalties)) * 100).toFixed(2) : "-"}%)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold ">Marketplace: </span>
                <div className="flex gap-2 items-center">
                  <span>{totalMarketplaceFee ? totalMarketplaceFee / 1e18 : "-"}</span>
                  <span>({totalMarketplaceFee ? ((totalMarketplaceFee / (totalEstimated + totalMarketplaceFee + totalRoyalties)) * 100).toFixed(2) : "-"}%)</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleList} className=" px-6 py-2 rounded flex gap-2 items-center">
            <span>List</span>
            <span>{listItems.length}</span>
            <span>items</span>
          </button>
        </div>
      </div>
    </div>
  )
}
