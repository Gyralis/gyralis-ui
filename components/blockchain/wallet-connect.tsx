import { HtmlHTMLAttributes } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaWallet } from "react-icons/fa"
import { useAccount, useEnsName } from "wagmi"

export const WalletConnect = ({
  className,
  ...props
}: HtmlHTMLAttributes<HTMLDivElement>) => {
  const { address } = useAccount()
  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    query: {
      enabled: Boolean(address),
    },
  })

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            className={className}
            {...props}
            style={{
              ...props.style,
              opacity: ready ? 1 : 0.6,
              pointerEvents: ready ? "auto" : "none",
              userSelect: "none",
            }}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  >
                    <FaWallet className="size-4" />
                    <span className="hidden sm:inline">Connect wallet</span>
                    <span className="sm:hidden">Wallet</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-rose-300 bg-rose-100 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-200 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                  >
                    Wrong network
                  </button>
                )
              }

              const walletLabel = account.ensName ?? ensName ?? account.displayName

              return (
                <button
                  type="button"
                  onClick={openAccountModal}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  title={account.address}
                >
                  <FaWallet className="size-4 text-primary" />
                  <span>{walletLabel}</span>
                </button>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
