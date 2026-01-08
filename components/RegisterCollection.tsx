"use client"
import { useState } from "react"
import { useRegisterCollection } from "./Contract"
import { FaTimes } from "react-icons/fa"

export function RegisterCollection() {
  const [cardOpen, setCardOpen] = useState<boolean>(false)
  const [collectionAddress, setCollectionAddress] = useState<`0x${string}` | string>("")
  const [royaltyFee, setRoyaltyFee] = useState<number | string>("")
  const { registerCollection } = useRegisterCollection()
  const handleCollectionRegister = async () => {
    try {
      const _fee = BigInt(Number(royaltyFee) * 100)
      const _collectionAddress: any = collectionAddress
      console.log(royaltyFee, _fee, _collectionAddress)
      const hash = await registerCollection(_collectionAddress, _fee)
    } catch (e) {}
  }
  return (
    <div className="py-4">
      {!cardOpen && (
        <div className="w-full">
          <button className="rounded p-2 w-full border border-(--accent) bg-transparent! text-(--accent)!" onClick={() => setCardOpen(true)}>
            Register your colletion
          </button>
        </div>
      )}
      {cardOpen && (
        <div className="card rounded p-4">
          <div className="flex justify-between mb-5">
            <h2 className="text-xl font-bold">Register your colletion</h2>

            <FaTimes onClick={() => setCardOpen(false)} className="text-(--accent) hover:opacity-75 hover:cursor-pointer" />
          </div>
          <div className="flex gap-2 items-center p-2 rounded-xl border border-(--accent)/30 bg-(--accent)/20 justify-between">
            <div className="flex flex-3 gap-2 items-center ">
              <span>Address: </span>
              <input type="text" value={collectionAddress} onChange={(e) => setCollectionAddress(e.target.value)} placeholder="0x1234..." className="p-2 bg-transparent! w-full" />
            </div>
            <div className="flex flex-1 gap-2 items-center">
              <span>Royalty fee: </span>
              <input type="number" max={10} value={royaltyFee} onChange={(e) => setRoyaltyFee(e.target.value)} placeholder="0%" className="p-2 bg-transparent! w-10" />
              <span>% </span>
            </div>
            <button className="rounded flex-1 p-2" onClick={handleCollectionRegister}>
              Register
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
