"use client"

import { useState } from "react"
import Image from "next/image"
import { FiExternalLink } from "react-icons/fi"
import { LuLaptop } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { BackToLoopsLink } from "@/components/layout/back-to-loops-link"
import { LinkComponent } from "@/components/shared/link-component"

const eligibilityRequirements = [
  {
    id: 1,
    name: "Gardens",
    description:
      "Gyralis connects Loops with Gardens communities such as 1Hive and Markee. Join the community required by a Loop to participate in its governance and start claiming daily rewards.",
    modalDescription:
      "Join the Gardens community required by your Loop. Gyralis verifies your connected wallet’s membership automatically.",
    requirement: "Community Membership",
    network: "Gnosis / Base",
    status: "active",
    icon: LuLaptop,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    steps: [
      "Open the Gardens community required by the Loop, such as 1Hive or Markee.",
      "Connect the same wallet you use in Gyralis.",
      "Review the community covenant, select Join, and stake the required community token.",
      "Return to Gyralis and enter the Loop. Your membership will be verified automatically.",
    ],
    protocolUrl: "https://app.gardens.fund/gardens",
    coverUrl: "/gardens-cover.png",
    logoUrl: "/gardens-logo.png",
    type: "loop",
  },
  {
    id: 2,
    name: "Blockscout Merits",
    description:
      "Use Blockscout Merits to redeem the Gyralis offer, verify your wallet, and unlock daily rewards from the Blockscout Loop.",
    modalDescription:
      "Redeem the Gyralis Loop Rewards offer with Blockscout Merits. Gyralis verifies the connected wallet’s redemption automatically.",
    requirement: "Redeem Gyralis Offer",
    network: "Gnosis",
    status: "active",
    icon: LuLaptop,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    steps: [
      "Go to the Blockscout Merits Explorer and connect your wallet. You’ll receive 100 Merits.",
      "Open the Spend Merits tab and find the Gyralis Loop Rewards.",
      "Redeem the offer for 50 Merits.",
      "Come back to Gyralis and enter the Blockscout Merits loop. Claim daily rewards.",
    ],
    //dev url
    // protocolUrl: "https://points.k8s-dev.blockscout.com/?tab=spend",
    protocolUrl: "https://merits.blockscout.com/?tab=spend",
    coverUrl: "/blockscout-cover.png",
    logoUrl: "/blockscout-logo.png",
    type: "loop",
  },
  {
    id: 3,
    name: "Human Passport",
    description:
      "Build your Human Passport score to prove you’re a unique participant, pass a Loop’s shield, and unlock its rewards.",
    requirement: "Passport Score",
    status: "active",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    steps: [
      "Go to the Human Passport app and sign in with Ethereum.",
      "Collect “stamps” to validate your identity and earn passport score.",
      "Go to the GyraHub and view your passport score.",
    ],
    protocolUrl: "https://app.passport.xyz/",
    coverUrl: "/passport-cover.png",
    logoUrl: "/passport-logo.svg",
    type: "shield",
  },
]

export default function ElegibilityPage() {
  const [selectedEligibility, setSelectedEligibility] = useState<
    (typeof eligibilityRequirements)[0] | null
  >(null)
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="relative z-10 mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-16 pt-6 font-body sm:px-6 lg:pl-32 lg:pr-8 lg:pt-8 xl:pl-36 xl:pr-10">
        <header className="group relative min-h-[340px] overflow-hidden rounded-[2rem] border border-border/70 bg-transparent sm:min-h-[380px] dark:bg-slate-950">
          <Image
            src="/eligibilities-header.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1536px) 1360px, (min-width: 1024px) calc(100vw - 11rem), calc(100vw - 2rem)"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.36)_0%,rgba(2,6,23,0.23)_38%,rgba(2,6,23,0.07)_100%),linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.26)_100%)] dark:bg-[linear-gradient(90deg,rgba(2,6,23,0.72)_0%,rgba(2,6,23,0.46)_38%,rgba(2,6,23,0.14)_100%),linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.52)_100%)]" />
          <BackToLoopsLink className="absolute left-5 top-5 z-20 border-white/15 bg-black/35 text-slate-200 hover:border-primary/45 hover:bg-primary/15 hover:text-primary sm:left-6 sm:top-6" />
          <div className="relative z-10 flex min-h-[340px] flex-col justify-end gap-5 p-6 sm:min-h-[380px] sm:p-8 xl:p-10">
            <div className="space-y-3">
              <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-slate-100 sm:text-6xl xl:text-7xl">
                Gyralis{" "}
                <span className="bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)] bg-clip-text text-transparent">
                  Eligibilities
                </span>
              </h1>
              <p className="max-w-5xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
                Enter the Loops and claim daily rewards by meeting the
                eligibility requirements across the Gyralis ecosystem.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          {eligibilityRequirements.map((requirement) => {
            const Icon = requirement.icon
            return (
              <div
                key={requirement.id}
                className={`tamagotchi-card flex min-h-[280px] flex-col p-4 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:min-h-[300px] sm:p-6 md:p-8 ${
                  requirement.status === "coming-soon" ? "opacity-60" : ""
                }`}
              >
                <div className="mb-4 flex items-center space-x-2 sm:space-x-4">
                  <div className="rounded-3xl bg-white/55 p-3 backdrop-blur-md dark:bg-white/10 shrink-0 border border-white/30 shadow-lg dark:border-white/20">
                    {requirement.logoUrl && (
                      <div className="flex size-6 items-center justify-center sm:size-8">
                        <Image
                          src={requirement.logoUrl}
                          alt={`${requirement.name} logo`}
                          width={28}
                          height={28}
                          className="size-6 object-contain sm:size-8"
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading text-lg font-semibold leading-tight  sm:text-xl">
                        {requirement.name}
                      </h3>
                      {requirement.status === "coming-soon" && (
                        <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 font-body text-xs shadow-sm sm:text-sm">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex-1 sm:mb-6">
                  <p className="font-body text-sm leading-relaxed  opacity-70 sm:text-base">
                    {requirement.description}
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="font-body text-xs font-medium  sm:text-sm">
                      Requirement:
                    </span>
                    <span className="rounded-full px-2 py-1 font-body text-xs font-semibold bg-accent text-accent-foreground sm:px-3 sm:text-sm">
                      {requirement.requirement}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEligibility(requirement)}
                    disabled={requirement.status === "coming-soon"}
                    className="tamagotchi-button-secondary flex min-h-[44px] w-full items-center justify-center px-3 py-2 font-body text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4 sm:text-sm"
                  >
                    {requirement.id != 3 ? "Be eligible" : "Pass the Shield"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="tamagotchi-card pointer-events-none mt-8">
          <h2 className="mb-4 font-heading text-xl font-semibold sm:mb-6 sm:text-2xl">
            How Eligibility Works
          </h2>
          <div className="space-y-3 font-body text-sm leading-6 text-muted-foreground sm:space-y-4 sm:text-base">
            <p>
              • Each Loop defines its own eligibility requirement and Gyralis
              verifies it automatically.
            </p>
            <p>
              • Requirements are checked against the wallet connected to
              Gyralis, so use the same wallet with each eligibility provider.
            </p>
            <p>• Eligibility is verified whenever you enter or claim.</p>
          </div>
        </div>

        {selectedEligibility && (
          <Modal
            isOpen={!!selectedEligibility}
            onClose={() => setSelectedEligibility(null)}
            title={
              <div className="flex items-center gap-2">
                {selectedEligibility.logoUrl && (
                  <Image
                    src={selectedEligibility.logoUrl}
                    alt={`${selectedEligibility.name} logo`}
                    width={18}
                    height={18}
                    className="h-4.5 w-4.5 object-contain"
                  />
                )}
                <span>{selectedEligibility.name}</span>
              </div>
            }
            size="md"
          >
            <div className="space-y-6">
              <Image
                src={selectedEligibility.coverUrl}
                alt={selectedEligibility.name}
                width={1200}
                height={320}
                className="w-full object-contain"
              />

              {selectedEligibility.modalDescription && (
                <div className="space-y-4">
                  <p className="font-body text-sm leading-6 text-muted-foreground">
                    {selectedEligibility.modalDescription}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/35 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Requirement
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {selectedEligibility.requirement}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/35 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Network
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {selectedEligibility.network}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-4 text-lg font-bold text-foreground">
                  {selectedEligibility.id != 3
                    ? "How to be eligible"
                    : "How to pass the Shield"}
                </h3>
                <div className="space-y-3">
                  {selectedEligibility.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent border border-border dark:bg-secondary text-sm font-bold text-secondary-foreground shadow-lg">
                        {index + 1}
                      </div>
                      <p className="flex-1 font-body text-sm  text-foreground">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6 flex items-center gap-1">
                <a
                  href={selectedEligibility.protocolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    className="w-full font-baloo"
                    // icon={<FiExternalLink />}
                  >
                    Visit {selectedEligibility.name}{" "}
                    <FiExternalLink className="size-4" />
                  </Button>
                </a>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
