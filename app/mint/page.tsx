"use client"

import MintForm from "@/components/MintForm"
import { NftStats } from "@/components/NFTStats"
import BurnCard from "@/components/BurnCard"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { FiInfo } from "react-icons/fi"
import { FaFire, FaChevronDown } from "react-icons/fa"
import HowItWorks from "@/components/HowItWorks"

export default function MintPage() {
  const [mounted, setMounted] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [activeCard, setActiveCard] = useState<"mint" | "burn">("mint")

  useEffect(() => {
    setMounted(true)
  }, [])

  const switchCard = () => {
    setActiveCard(activeCard === "mint" ? "burn" : "mint")
  }
  return (
    <div className="flex justify-center min-h-120 w-full items-center relative card">
      <AnimatePresence>
        {mounted && activeCard === "mint" && (
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="flex gap-20 justify-center items-end absolute"
          >
            <div className=" flex flex-col justify-center rounded  p-2 card">
              <div className="flex justify-end">
                <button onClick={() => setShowInfo(true)} className="rounded-[100%] ">
                  <FiInfo size={18} className="bg-(--bg-secondary) text-(--accent)" />
                </button>
              </div>
              <div className="flex justify-center">
                <NftStats />
              </div>
              <MintForm />
            </div>
            <div
              onClick={switchCard}
              className="hover:opacity-100 text-(--accent) hover:text-[#ff7b00b5] opacity-25 transition-all duration-200 hover:cursor-pointer absolute top-[-36px] rounded bg-linear-to-t from-[#6365f158] to-transparent p-2 w-full flex items-center justify-center"
            >
              <FaFire className="" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mounted && activeCard === "burn" && (
          <motion.div
            initial={{ opacity: 0, y: -120, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -120, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="flex gap-20 justify-center items-end absolute"
          >
            <BurnCard />
            <div
              onClick={switchCard}
              className=" hover:opacity-100 opacity-25 transition-opacity duration-200 hover:cursor-pointer absolute bottom-[-36px] rounded bg-linear-to-b from-[#6365f158] to-transparent p-2 w-full flex items-center justify-center"
            >
              <FaChevronDown className="text-(--accent)" />
            </div>
          </motion.div>
        )}
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
