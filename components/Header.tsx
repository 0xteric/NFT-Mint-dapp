import Link from "next/link"

export default function Header() {
  return (
    <header className="p-4 flex justify-center">
      <div className="rounded-2xl flex bg-[#00000080] p-2 shadow-black shadow w-150">
        <h1 className="text-xl font-bold flex-1 p-1.25">NFT mint dapp</h1>
        <nav className="flex gap-4 flex-1 justify-center ">
          <Link href="/">Home</Link>
          <Link href="/mint">Mint</Link>
        </nav>
        <div className="flex-1 "></div>
      </div>
    </header>
  )
}
