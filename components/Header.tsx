"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import ConnectWallet from "./ConnectWallet"
import ThemeToggle from "../app/ThemeToggle"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [menuCard, setMenuCard] = useState(false)

  const pathname = usePathname()

  const switchMenuCard = (e: any) => {
    setMenuCard(!menuCard)
  }
  const closeMenuCard = (e: any) => {
    if (e.target.id === "menu-bg") {
      setMenuCard(false)
    }
  }

  const linkClass = (path: string) => {
    if (menuCard) {
      return `h-7 ${pathname == path ? " opacity-72" : ""}`
    } else {
      return `h-7 ${pathname == path ? "border-b-[2px]" : "border-b-[2px] border-b-[transparent]"}`
    }
  }

  return (
    <header className=" flex justify-center items-center">
      <div className=" block lg:hidden  py-2 px-4  w-full items-center">
        <h1 className="text-xl font-bold justify-center flex flex-1 p-1.25">SUP!</h1>

        <div className="fixed left-0 top-0 flex flex-col items-start z-50 ">
          {menuCard && <div id="menu-bg" onClick={closeMenuCard} className="absolute w-screen h-screen bg-[#0000007a] z-55"></div>}
          <div className="p-2 mb-2 z-60">
            <button onClick={switchMenuCard} className=" bg-transparent!">
              <div
                className={
                  "flex flex-col justify-center items-center gap-1.5 p-2 transition-all duration-300 " +
                  (menuCard ? "rotate-90  aspect-square bg-(--accent) rounded border border-(--bg-secondary)" : " ")
                }
              >
                <div className={"  transition-all duration-300 px-3.5 py-0.5  " + (menuCard ? " translate-y-2.5 rotate-45 bg-[white] " : "bg-(--text) ")}></div>
                <div className={"  transition-all duration-300 px-3.5 py-0.5  " + (menuCard ? " translate-y-0 -rotate-45 bg-[white] " : "bg-(--text)")}></div>
                <div className={"  transition-all duration-300 px-3.5 py-0.5   " + (menuCard ? "scale-0 " : "bg-(--text)")}></div>
              </div>
            </button>
          </div>
          <AnimatePresence>
            {menuCard && (
              <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.2 }} className="z-60">
                <div className="px-2 -mt-4">
                  <div className="card rounded border border-(--bg) mt-2 transition-all duration-300 min-w-[100px]">
                    <nav className="flex gap-4 flex-col text-sm p-2 text-center ">
                      <Link href="/" className={linkClass("/")}>
                        HOME
                      </Link>
                      <Link href="/mint" className={linkClass("/mint")}>
                        MINT
                      </Link>
                    </nav>
                    <div className="border-t opacity-30"></div>
                    <div className="p-2">
                      <ConnectWallet textMsg={""} />
                    </div>
                    <div className="border-t opacity-30"></div>
                    <div className="p-2  flex gap-2">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className=" hidden lg:block  py-2 px-4  w-full items-center">
        <div className="flex w-full">
          <nav className="flex gap-4 flex-1  ">
            <Link href="/" className={linkClass("/")}>
              HOME
            </Link>
            <Link href="/mint" className={linkClass("/mint")}>
              MINT
            </Link>
          </nav>
          <h1 className="text-xl font-bold justify-center flex flex-1 p-1.25">SUP!</h1>
          <div className="flex gap-4 items-center justify-end flex-1 ">
            <div>
              <ThemeToggle />
            </div>
            <div className="flex">
              <ConnectWallet textMsg={"CONNECT WALLET"} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
