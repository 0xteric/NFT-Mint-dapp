"use client"

import MintForm from "@/components/MintForm"
import { NftStats } from "@/components/NFTStats"
import BurnCard from "@/components/BurnCard"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { FiInfo } from "react-icons/fi"
import HowItWorks from "@/components/HowItWorks"

export default function MintPage() {
  const [mounted, setMounted] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex gap-2 min-h-120 w-full max-w-full lg:w-[70%] mx-auto items-center relative">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 120, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="flex w-full flex-col flex-1 relative "
        >
          <div>
            <div className="flex justify-end mb-5 ">
              <button onClick={() => setShowInfo(true)} className="bg-transparent! text-(--accent)!">
                <FiInfo size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 rounded card w-full p-4 flex-col md:flex-row items-stretch ">
            <div className="flex-1 flex flex-col rounded-xl border  border-(--accent)/30! bg-(--accent)/20 ">
              <div className="flex justify-center items-center  flex-1 p-2">
                <NftStats />
              </div>

              <MintForm />
            </div>

            <div className="flex-2 flex rounded-xl bg-(--accent)/20 border  border-(--accent)/30!">
              <BurnCard />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="fixed inset-0  flex items-center justify-center"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HowItWorks onClose={() => setShowInfo(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
