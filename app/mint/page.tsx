import MintForm from "@/components/MintForm"
import NftStats from "@/components/NftStats"
export default function MintPage() {
  return (
    <div className="flex justify-center flex-col items-center">
      <MintForm />
      <NftStats />
    </div>
  )
}
