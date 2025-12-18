"use client"

import MintForm from "@/components/MintForm"
import { NftStats } from "@/components/NFTStats"

export default function MintPage() {
  return (
    <div className="flex justify-center flex-col items-center">
      <MintForm />
      <NftStats />
    </div>
  )
}
