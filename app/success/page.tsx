import { Suspense } from "react"
import SuccessContent from "@/components/success-content"

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuccessContent />
    </Suspense>
  )
}
