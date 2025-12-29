"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import ConnectWallet from "./ConnectWallet"
import ThemeToggle from "../app/ThemeToggle"

export default function Header() {
  const pathname = usePathname()

  const linkClass = (path: string) => `h-7 ${pathname == path ? "border-b-[2px]" : "border-b-[2px] border-b-[transparent]"}`

  return (
    <header className=" flex justify-center w-full items-center">
      <div className=" flex  py-2 px-4  w-full items-center">
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
          <div className="z-10">
            <ThemeToggle />
          </div>
          <div className="flex z-10">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </header>
  )
}
