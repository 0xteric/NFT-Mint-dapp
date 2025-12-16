import Link from "next/link"

export default function Header() {
  return (
    <header className="p-4 rounded flex">
      <h1 className="text-xl font-bold flex-1 ">NFT mint dapp</h1>
      <nav className="flex gap-2 flex-1 justify-center ">
        <Link href="/">Home</Link>
        <Link href="/mint">Mint</Link>
      </nav>
      <div className="flex-1 "></div>
    </header>
  )
}
