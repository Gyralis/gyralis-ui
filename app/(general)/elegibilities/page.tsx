"use client"

import { useState } from "react"
import Image from "next/image"
import { FiExternalLink } from "react-icons/fi"
import { LuLaptop } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { LinkComponent } from "@/components/shared/link-component"

const eligibilityRequirements = [
  {
    id: 1,
    name: "Gardens",
    description:
      "Gardens is a bottom-up governance framework for web3 ecosystems. Register as a member in 1Hive community and participate in decentralized decision making.",
    requirement: "1Hive Membership",
    status: "active",
    icon: LuLaptop,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    steps: [
      "Go to the 1Hive community in Gardens platform and connect your wallet.",
      "Complete membership registration and stake 3 HNY tokens.",
      "Claim your daily loop rewards.",
    ],
    protocolUrl:
      "https://app.gardens.fund/gardens/100/0xe2396fe2169ca026962971d3b2e373ba925b6257",
    coverUrl: "/gardens-cover.png",
    logoUrl: "/gardens-logo.png",
  },
  {
    id: 2,
    name: "Blockscout Merits",
    description:
      "Blockscout Merits is a gamified rewards program that lets users earn points (“Merits”) by exploring the blockchain—claiming daily bonuses, completing tasks, using tools, and inviting others.",
    requirement: "Redeem Gyralis Offer",
    status: "active",
    icon: LuLaptop,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    steps: [
      "Visit Blockscout Merits explorer, sign up with your wallet and receive 100 Merits.",
      "Redeem Gyralis loop rewards offer - 50 merits.",
      "Claim your daily loop rewards.",
    ],
    protocolUrl: "https://points.k8s-dev.blockscout.com/?tab=spend",
    coverUrl: "/blockscout-cover.png",
    logoUrl: "/blockscout-logo.png",
  },

  {
    id: 3,
    name: "Human Passport",
    description:
      "Verify your Humanity. Collect stamps and build your unique passport score of +15 and pass the loop shield to be eligible.",
    requirement: "Passport Score",
    status: "active",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    steps: [
      "Sign in with Ethereum",
      "Collect “stamps” to validate your identity and earn passport score.",
      "Submit or update your score in the GyraHub.",
    ],
    protocolUrl: "https://app.passport.xyz/",
    coverUrl: "/passport-cover.png",
    logoUrl: "/passport-logo.svg",
  },
]

export default function ElegibilityPage() {
  const [selectedEligibility, setSelectedEligibility] = useState<
    (typeof eligibilityRequirements)[0] | null
  >(null)
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 font-body">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-3 font-heading text-2xl font-bold  md:mb-4 md:text-3xl">
            Eligibility Requirements
          </h1>
          <p className="font-body text-sm opacity-70 md:text-base">
            Meet these requirements to participate in various loops and claim
            rewards.
          </p>
        </div>

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
                      <div className="flex h-6 w-6 items-center justify-center sm:h-8 sm:w-8">
                        <Image
                          src={requirement.logoUrl}
                          alt={`${requirement.name} logo`}
                          width={28}
                          height={28}
                          className="h-6 w-6 object-contain sm:h-8 sm:w-8"
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
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
                    How to be eligible
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="tamagotchi-card mt-8">
          <h2 className="mb-4 font-heading text-xl font-semibold  sm:mb-6 sm:text-2xl">
            How Eligibility Works
          </h2>
          <div className="space-y-3 font-body text-sm  opacity-80 sm:space-y-4 sm:text-base">
            <p>• Each loop has different eligibility requirements.</p>

            <p>
              • Each loop may have its own unique Human Passport score to meet.
            </p>

            <p>
              • Elegibilities are checked every time you attempt to register or
              claim.
            </p>
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

              <div>
                <h3 className="mb-4 text-lg font-bold text-foreground">
                  How to become eligible:
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
