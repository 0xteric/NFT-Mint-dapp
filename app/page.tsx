"use client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import ListedNFTS from "@/components/ListedNFTS"
import ListNft from "@/components/ListNFT"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  })

  return (
    <div className="flex flex-col items-center justify-center gap-4 font-sans w-full  text-center  ">
      <AnimatePresence>
        {mounted && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Thanks for reaching my dApp</h2>

            <p className="max-w-2xl">
              This project was built as a production-like NFT minting dApp. Its goal is to showcase best practices in modern Web3 development: from smart contracts to UX around blockchain
              transactions.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 justify-center items-center"
          >
            <div
              className="px-8 py-4 rounded  card
 
  "
            >
              <ul className="list-disc text-left mt-4 space-y-1 mb-2 ">
                <li>Smart contract development with Solidity (ERC-721).</li>
                <li>Foundry for testing, scripting and deployment.</li>
                <li>Frontend integration with Next.js (App Router).</li>
                <li>Wallet connection using Wagmi and Viem.</li>
                <li>Managing blockchain transaction states.</li>
                <li>Web3 UX patterns: wallet state and network switching.</li>
                <li>Clean separation between UI and blockchain logic.</li>
                <li>Environment-based configuration.</li>
              </ul>
            </div>
            <Link href="/mint">
              <button className="py-2 px-4 rounded-4xl mt-3 w-fit flex gap-2 hover:opacity-85 ">
                <span>Go to mint</span>
                <span>&rarr;</span>
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="w-full mt-5 relative p-10">
        <div className="card rounded p-2 w-full">
          <ListedNFTS />
        </div>
      </section>
    </div>
  )
}
