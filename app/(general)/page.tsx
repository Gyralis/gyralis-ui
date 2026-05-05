"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { FaNetworkWired, FaShieldAlt, FaTrophy, FaUsers } from "react-icons/fa"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 dark:from-background dark:via-background dark:to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="floating absolute left-10 top-20 size-8 rounded-full bg-orange-300 opacity-60 dark:opacity-30"></div>
          <div className="floating absolute left-1/4 top-60 size-4 rounded-full bg-green-300 opacity-60 dark:opacity-30"></div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <motion.div
              className="space-y-8"
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
                className="max-w-lg font-body text-xl leading-relaxed text-gray-600 dark:text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Gyralis helps communities reward real humans for daily
                participation through score-gated loops and Human Passport
                verification.
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
                  Launch Prototype
                </Link>
                <Link
                  href="#how-it-works"
                  className="tamagotchi-button-secondary flex items-center justify-center gap-2 px-8 py-4 text-lg transition-all ease-out"
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Gyralis Section */}
      <motion.div
        id="why-gyralis"
        className="mx-auto max-w-6xl px-4 py-16 md:py-24"
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
            Built for communities that value real participation
          </p>
        </motion.div>

        {/* Feature cards with stagger animation */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FaShieldAlt,
              gradient: "from-orange-400 to-pink-400",
              title: "Turn Rituals into Proofs",
              description:
                "Convert daily or weekly check-ins into verifiable participation.",
              delay: 0,
            },
            {
              icon: FaShieldAlt,
              gradient: "from-blue-400 to-teal-400",
              title: "Stay Human-First",
              description:
                "Identity shields protect privacy while keeping bots out.",
              delay: 0.1,
            },
            {
              icon: FaUsers,
              gradient: "from-green-400 to-emerald-400",
              title: "Built for Communities",
              description:
                "DAOs and guilds can design loops that match their rhythms.",
              delay: 0.2,
            },
            {
              icon: FaNetworkWired,
              gradient: "from-purple-400 to-indigo-400",
              title: "Cross-Chain, Frictionless",
              description:
                "Claim and track activity across Ethereum, Gnosis, Optimism, and more.",
              delay: 0.3,
            },
            {
              icon: FaShieldAlt,
              gradient: "from-yellow-400 to-orange-400",
              title: "Always Transparent",
              description:
                "Live leaderboards and open metrics show who's really active.",
              delay: 0.4,
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
                <feature.icon className="size-7 text-white" />
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
        className="mx-auto max-w-6xl px-4 py-16 md:py-24"
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
            Verify humanity, join eligible loops, and claim daily.
          </p>
        </motion.div>

        {/* Steps with alternating slide animations */}
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: FaShieldAlt,
              gradient: "from-blue-400 to-teal-400",
              number: 1,
              title: "Prove You're Human",
              description:
                "Connect your wallet and verify with Human Passport.",
              direction: -50,
            },
            {
              icon: FaUsers,
              gradient: "from-green-400 to-emerald-400",
              number: 2,
              title: "Join an Eligible Loop",
              description:
                "Enter loops that match your Human Passport score and meet the requirements to join.",
              direction: 0,
            },
            {
              icon: FaTrophy,
              gradient: "from-orange-400 to-pink-400",
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
        className="mx-auto max-w-6xl px-4 py-16 md:py-24"
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
                "Community network connected to Gyralis loop eligibility through Gardens.",
              logoUrl: "/1Hive-logo.png",
              delay: 0,
            },
            {
              name: "Blockscout",
              description:
                "Explorer and Merits integration for checking loop entrance requirements.",
              logoUrl: "/blockscout-logo.png",
              delay: 0.1,
            },
            {
              name: "Human Passport",
              description:
                "Human verification and score checks used to keep loop access human-first.",
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
        className="mx-auto max-w-4xl px-4 py-16 md:py-24"
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
            Ready to Join the Loop?
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
              Launch Prototype
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
