import { Button } from "@/components/ui/button"

import { useSubmitPassport } from "../hooks/use-submit-passport"

export const SubmitPassportButton = ({
  onSuccess,
}: {
  onSuccess: () => void
}) => {
  const { submitPassport, isLoading } = useSubmitPassport()
  return (
    <div>
      <div className="mb-2 text-sm">
        <div className="font-semibold">Refresh Passport Score</div>
        Request the latest score for your connected wallet. This operation does
        not include any fees.
      </div>
      <Button
        className="w-auto space-x-4"
        onClick={() => {
          submitPassport()
            .then(() => onSuccess())
            .catch(console.error)
        }}
        disabled={isLoading}
      >
        Refresh score
      </Button>
    </div>
  )
}
