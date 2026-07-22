"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FaArrowRight,
  FaCalendarCheck,
  FaDoorOpen,
  FaShieldAlt,
  FaTrophy,
  FaUsers,
} from "react-icons/fa"
import { PiFingerprintLight } from "react-icons/pi"

import { HowLoopsWork } from "@/components/loops/how-loops-work"

type HeroFloatingMark = {
  size: number
  colorClass: string
  rotation: number
  animationDelay: number
  animationDuration: number
}

const heroFloatingColors = [
  "text-orange-300",
  "text-blue-300",
  "text-green-300",
  "text-pink-300",
  "text-teal-300",
  "text-purple-300",
]

function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min))
}

function createHeroFloatingMark(): HeroFloatingMark {
  return {
    size: randomBetween(220, 300),
    colorClass:
      heroFloatingColors[randomBetween(0, heroFloatingColors.length - 1)],
    rotation: randomBetween(-28, 28),
    animationDelay: randomBetween(0, 20) / 10,
    animationDuration: randomBetween(30, 58) / 10,
  }
}

function GyralisFloatingMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 292 260"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M29.6602 231.698C29.6602 231.698 54.3786 265.642 139.863 257.985C225.351 250.329 342.843 175.285 267.997 115.504C193.149 55.7228 52.4654 110.259 137.054 143.581C137.054 143.581 110.864 123.283 140.498 112.032C163.551 103.278 181.576 104.247 188.277 105.882C191.118 106.576 194.308 106.756 196.519 107.352C214.284 112.139 284.115 129.668 252.347 188.73C223.281 242.773 129.808 250.491 94.4295 251.444C83.8967 251.73 73.6512 250.782 63.8115 248.495C51.4453 245.624 35.7887 240.413 29.6602 231.698Z"
        fill="currentColor"
      />
      <path
        d="M49.9566 29.2191C44.3992 35.4111 41.763 43.1043 39.9243 52.5282C38.0772 61.9592 37.4997 72.1216 38.1929 83.0199C38.8838 93.9223 40.7716 104.681 43.8535 115.294C46.936 125.911 51.2451 136.007 56.7927 145.584C62.3304 155.165 69.0697 163.232 77.001 169.797C84.924 176.356 93.9881 181.105 104.177 184.041C114.36 186.976 125.651 187.161 138.045 184.59C150.656 181.975 160.649 177.488 168.026 171.117C175.405 164.752 182.802 158.755 187.663 152.784C190.596 149.181 205.708 126.499 205.914 126.342C202.727 140.047 197.408 152.616 189.963 164.046C186.949 168.879 183.274 173.744 178.936 178.637C174.598 183.532 169.577 188.101 163.881 192.326C158.176 196.562 151.691 200.218 144.42 203.303C137.144 206.39 128.956 208.561 119.859 209.816C107.123 211.828 95.4901 211.869 84.9546 209.953C74.4143 208.034 65.0248 204.888 56.762 200.496C48.5049 196.11 41.2796 190.824 35.1061 184.631C28.9262 178.449 23.6946 172.011 19.4211 165.322C15.1397 158.639 11.7056 151.991 9.11927 145.374C6.52539 138.761 4.70895 132.93 3.66655 127.886C0.672037 113.362 0.0450102 99.29 1.81005 85.675C3.55883 72.0577 7.74767 59.673 14.3584 48.5211C20.9669 37.3666 29.9637 27.7689 41.3446 19.7329C72.881 -2.55457 120.412 -7.68641 153.828 13.2911C122.985 8.38299 75.6808 0.55333 49.9566 29.2191Z"
        fill="currentColor"
      />
    </svg>
  )
}

function HeroFloatingLogo({ mark }: { mark: HeroFloatingMark }) {
  return (
    <div
      className={`floating ${mark.colorClass} opacity-70 dark:opacity-45`}
      style={{
        width: `${mark.size}px`,
        height: `${Math.round(mark.size * 0.89)}px`,
        transform: `rotate(${mark.rotation}deg)`,
        animationDelay: `${mark.animationDelay}s`,
        animationDuration: `${mark.animationDuration}s`,
      }}
    >
      <GyralisFloatingMark className="size-full drop-shadow-xl" />
    </div>
  )
}

export default function HomePage() {
  const [heroFloatingMark, setHeroFloatingMark] =
    useState<HeroFloatingMark | null>(null)

  useEffect(() => {
    setHeroFloatingMark(createHeroFloatingMark())
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 dark:from-background dark:via-background dark:to-background">
      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
            <motion.div
              className="max-w-3xl space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="font-heading text-5xl leading-tight text-gray-800 dark:text-foreground lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Prove Participation.
                <br />
                <span className="text-primary">Earn Rewards.</span>
                <br />
                <span className="text-secondary">Build Trust.</span>
              </motion.h1>

              <motion.p
                className="max-w-lg font-body text-xl leading-relaxed text-accent-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Gyralis helps protocols and communities reward verified humans
                for consistent participation through proof-based loops.
              </motion.p>

              <motion.div
                className="flex flex-col gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link
                  href="/loops"
                  className="tamagotchi-button flex items-center justify-center gap-2 px-8 py-4 text-lg transition-all ease-out"
                >
                  Enter the Loop
                  <FaArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </motion.div>

            {heroFloatingMark != null && (
              <motion.div
                className="hidden min-h-80 items-center justify-center lg:flex"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                aria-hidden="true"
              >
                <HeroFloatingLogo mark={heroFloatingMark} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Why Gyralis Section */}
      <motion.div
        id="why-gyralis"
        className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl">
            Why Gyralis?
          </h2>
          <p className="font-body text-xl text-gray-600 dark:text-muted-foreground">
            A participation layer for human-first protocols.
          </p>
        </motion.div>

        {/* Feature cards with stagger animation */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              gradient: "from-orange-400 to-pink-400",
              title: "Turn Rituals into Proofs",
              description:
                "Convert daily check-ins into verifiable participation.",
              delay: 0,
            },
            {
              gradient: "from-blue-400 to-teal-400",
              title: "Loops Keep It Human",
              description: "Loops are human-first proof of personhood.",
              delay: 0.1,
            },
            {
              gradient: "from-green-400 to-emerald-400",
              title: "Built for Protocols & Communities",
              description:
                "DAOs and protocols can design loops that match their rhythms.",
              delay: 0.2,
            },
            // {
            //   gradient: "from-purple-400 to-indigo-400",
            //   title: "Frictionless",
            //   description:
            //     "Claim and track activity across Ethereum, Gnosis, Optimism, and more.",
            //   delay: 0.3,
            // },
            {
              gradient: "from-yellow-400 to-orange-400",
              title: "Always Transparent",
              description:
                "Live leaderboards and open metrics show who's really active.",
              delay: 0.4,
            },
            {
              gradient: "from-cyan-400 to-blue-500",
              title: "Gate Rewards by Eligibility",
              description:
                "Make rewards available only to contributors who meet the loop's entry requirements.",
              delay: 0.5,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="tamagotchi-card"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.div
                className={`size-14 rounded-full bg-gradient-to-br ${feature.gradient} mb-4 flex items-center justify-center shadow-lg`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <GyralisFloatingMark className="size-8 text-white" />
              </motion.div>
              <h3 className="mb-2 font-heading text-xl text-gray-800 dark:text-foreground">
                {feature.title}
              </h3>
              <p className="font-body text-gray-600 dark:text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        id="how-it-works"
        className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl">
            How It Works
          </h2>
          <p className="font-body text-xl text-gray-600 dark:text-muted-foreground">
            Verify humanity, enter eligible loops, and claim daily.
          </p>
        </motion.div>

        {/* Steps with alternating slide animations */}
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: PiFingerprintLight,
              gradient: "from-secondary to-primary",
              number: 1,
              title: "Prove You're Human",
              description:
                "Connect your wallet and open GyraHub to get verified.",
              direction: -50,
            },
            {
              icon: FaDoorOpen,
              gradient: "from-secondary to-primary",
              number: 2,
              title: "Enter an Eligible Loop",
              description:
                "Enter the loops clycles  if you have human passport score and meet the elegibility requirement to join.",
              direction: 0,
            },
            {
              icon: FaCalendarCheck,
              gradient: "from-secondary to-primary",
              number: 3,
              title: "Claim Every Day",
              description:
                "Return daily to claim your share while the loop is active.",
              direction: 50,
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="space-y-4 text-center"
              initial={{ opacity: 0, x: step.direction }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`size-24 rounded-full bg-gradient-to-br ${step.gradient} mx-auto flex items-center justify-center shadow-2xl`}
                >
                  <step.icon className="size-12 text-white" />
                </div>
                <motion.div
                  className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-primary font-bold text-white shadow-lg"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.2 + 0.3,
                    type: "spring",
                  }}
                >
                  {step.number}
                </motion.div>
              </motion.div>
              <h3 className="font-heading text-2xl text-gray-800 dark:text-foreground">
                {step.title}
              </h3>
              <p className="font-body text-gray-600 dark:text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ecosystem Section */}
      <motion.div
        id="partners"
        className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl">
            Ecosystem Tools & Partners
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "1Hive",
              description:
                "Community connected to Gyralis for checking loop eligibility through Gardens.",
              logoUrl: "/1Hive-logo.png",
              delay: 0,
            },
            {
              name: "Blockscout",
              description:
                "Blockscout community Merits Program integration for checking loop eligibility.",
              logoUrl: "/blockscout-logo.png",
              delay: 0.1,
            },
            {
              name: "Human Passport",
              description:
                "Verifies humanity and score through GyraHub to keep loop access human-first.",
              logoUrl: "/passport-logo.svg",
              delay: 0.2,
            },
            {
              name: "Gardens",
              description:
                "DAO coordination framework powering community membership checks.",
              logoUrl: "/gardens-logo.png",
              delay: 0.3,
            },
          ].map((partner, index) => (
            <motion.div
              key={index}
              className="tamagotchi-card flex h-full flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: partner.delay }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-white/80 p-4 shadow-md ring-1 ring-black/5 dark:bg-card/80 dark:ring-white/10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: partner.delay + 0.2 }}
              >
                <Image
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  width={56}
                  height={56}
                  className="max-h-14 w-auto object-contain"
                />
              </motion.div>
              <h3 className="mb-2 font-heading text-2xl text-gray-800 dark:text-foreground">
                {partner.name}
              </h3>
              <p className="font-body text-sm leading-relaxed text-gray-600 dark:text-muted-foreground">
                {partner.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="space-y-8 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-12 text-center shadow-xl dark:from-primary/5 dark:to-secondary/5"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.h2
            className="font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Enter the Loop?
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl font-body text-xl text-gray-600 dark:text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Whether you are a steward, facilitator, partner, or contributor -
            Gyralis helps you prove participation and grow reputation.
          </motion.p>
          <motion.div
            className="flex flex-col justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/loops"
              className="tamagotchi-button flex items-center justify-center gap-2 px-10 py-5 text-lg transition-all ease-out"
            >
              Enter the Loop
              <FaArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <HowLoopsWork
              triggerLabel="See How It Works"
              triggerClassName="tamagotchi-button-secondary flex items-center justify-center gap-2 px-10 py-5 text-lg transition-all ease-out"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
