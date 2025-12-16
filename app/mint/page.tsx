import MintStatus from "@/components/MintStatus"
import MintForm from "@/components/MintForm"

export default function MintPage() {
  return (
    <div className="flex justify-center flex-col items-center">
      <MintStatus status="idle" />
      <MintForm />
    </div>
  )
}
