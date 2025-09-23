"use client"

import { useState } from "react"
import {
  LuActivitySquare,
  LuLaptop,
  LuMoon,
  LuShield,
  LuSun,
} from "react-icons/lu"

const eligibilityRequirements = [
  {
    id: 1,
    name: "1hive GardensV2",
    description:
      "Be registered as a member in 1hive GardensV2 governance system to participate in decentralized decision making",
    requirement: "GardensV2 membership",
    status: "active",
    icon: LuLaptop,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    steps: [
      "Visit the 1hive Gardens platform and connect your wallet",
      "Complete membership registration and stake required HNY tokens",
    ],
    protocolUrl: "https://gardens.1hive.org",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    name: "Blockscout Mertis",
    description:
      "Have verified activity on Blockscout Mertis network showing consistent blockchain interaction",
    requirement: "Mertis verification",
    status: "active",
    icon: LuLaptop,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    steps: [
      "Connect to Mertis network and perform at least 10 transactions",
      "Visit Blockscout Mertis explorer to verify your address activity",
    ],
    protocolUrl: "https://mertis.blockscout.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    name: "Transaction History",
    description:
      "Maintain an active on-chain presence with minimum of 5 transactions in the last 90 days",
    requirement: "5+ transactions",
    status: "active",
    icon: LuSun,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    steps: [
      "Ensure your wallet is active on supported networks",
      "Maintain at least 5 transactions in the last 90 days",
    ],
    protocolUrl: "https://etherscan.io",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    name: "ENS Domain",
    description:
      "Own an ENS domain name to establish your decentralized identity",
    requirement: "ENS ownership",
    status: "coming-soon",
    icon: LuShield,
    color: "text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    steps: [
      "Visit the ENS app and search for available domain names",
      "Register your preferred .eth domain and link it to your wallet",
    ],
    protocolUrl: "https://app.ens.domains",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    name: "Aura Shield",
    description:
      "Achieve a minimum Aura score through verified social interactions and community contributions",
    requirement: "Aura score 30+",
    status: "coming-soon",
    icon: LuShield,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    steps: [
      "Connect your social accounts and verify your identity through Aura protocol",
      "Participate in community activities to build your reputation score above 30",
    ],
    protocolUrl: "https://aura.org",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
]

export default function ElegibilityPage() {
  const [selectedEligibility, setSelectedEligibility] = useState<
    (typeof eligibilityRequirements)[0] | null
  >(null)
  return (
    <div className="min-h-screen">
      <div className="font-body mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="font-heading mb-3 text-2xl font-bold  md:mb-4 md:text-3xl">
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
                <div className="mb-4 flex items-start space-x-4 sm:space-x-6">
                  <div
                    className={`rounded-3xl p-3 sm:p-4 ${requirement.bgColor} flex-shrink-0 shadow-lg`}
                  >
                    <Icon
                      className={`h-6 w-6 sm:h-8 sm:w-8 ${requirement.color}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
                      <h3 className="font-heading text-lg font-semibold leading-tight  sm:text-xl">
                        {requirement.name}
                      </h3>
                      {requirement.status === "coming-soon" ? (
                        <span className="font-body flex-shrink-0 rounded-full bg-gray-200 px-3 py-1 text-xs  shadow-sm sm:text-sm">
                          Coming Soon
                        </span>
                      ) : (
                        <LuActivitySquare className="h-5 w-5 flex-shrink-0 text-green-500 sm:h-6 sm:w-6" />
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
                    <span className="font-body rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 sm:px-3 sm:text-sm">
                      {requirement.requirement}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEligibility(requirement)}
                    disabled={requirement.status === "coming-soon"}
                    className="tamagotchi-button-secondary font-body flex min-h-[44px] w-full items-center justify-center px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4 sm:text-sm"
                  >
                    How to be eligible
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="tamagotchi-card mt-8 border border-white/20 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 shadow-xl backdrop-blur-sm sm:mt-12 sm:p-6 md:p-8">
          <h2 className="font-heading mb-4 text-xl font-semibold  sm:mb-6 sm:text-2xl">
            How Eligibility Works
          </h2>
          <div className="font-body space-y-3 text-sm  opacity-80 sm:space-y-4 sm:text-base">
            <p>• Each loop may have different eligibility requirements</p>
            <p>
              • Requirements are checked automatically when you attempt to claim
            </p>
            <p>
              • Some requirements may be verified in real-time, others may
              require manual verification
            </p>
            <p>
              • Meeting higher requirements may unlock access to premium loops
              with better rewards
            </p>
          </div>
        </div>

        {/* {selectedEligibility && (
          <EligibilityModal
            isOpen={!!selectedEligibility}
            onClose={() => setSelectedEligibility(null)}
            eligibility={selectedEligibility}
          />
        )} */}
      </div>
    </div>
  )
}
