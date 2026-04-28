import { useMutation } from "@tanstack/react-query"
import { useAccount } from "wagmi"

export const useSubmitPassport = () => {
  const { address } = useAccount()

  const submitPassportMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("No address provided.")
      const response = await fetch("/api/gitcoin-passport/submit-passport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        return { success: true }
      }
      if (data.detail) throw data.detail
      throw new Error(response.statusText)
    },
  })

  const submitPassport = async () => {
    return await submitPassportMutation.mutateAsync()
  }

  return {
    submitPassport,
    isLoading: submitPassportMutation.isPending,
  }
}
