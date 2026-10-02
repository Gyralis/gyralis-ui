import { QueryClient } from "@tanstack/react-query"

export function createWalletQueryClient() {
  const client = new QueryClient()
  // ENS is optional display data. Share successful lookups and avoid repeatedly
  // retrying a rejected RPC when wallet controls mount or regain focus.
  for (const key of ["ensName", "ensAvatar"]) {
    client.setQueryDefaults([key], {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    })
  }
  return client
}
