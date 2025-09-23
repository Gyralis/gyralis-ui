import Image from "next/image"
import Link from "next/link"
import { FaDiscord, FaGithub } from "react-icons/fa"
import { LuBook } from "react-icons/lu"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  PageHeader,
  PageHeaderCTA,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layout/page-header"
import { CopyButton } from "@/components/shared/copy-button"
import { ExampleDemos } from "@/components/shared/example-demos"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="floating absolute left-10 top-20 h-8 w-8 rounded-full bg-orange-300 opacity-60"></div>
          <div className="floating absolute right-20 top-40 h-6 w-6 rounded-full bg-blue-300 opacity-60"></div>
          <div className="floating absolute left-1/4 top-60 h-4 w-4 rounded-full bg-green-300 opacity-60"></div>
          <div className="floating absolute bottom-40 right-10 h-10 w-10 rounded-full bg-pink-300 opacity-60"></div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left side - Text content */}
            <div className="space-y-8">
              <h1 className="font-heading text-5xl leading-tight text-gray-800 lg:text-6xl">
                Keep the
                <br />
                <span className="text-primary">Loop Alive.</span>
              </h1>

              <p className="font-body max-w-lg text-xl leading-relaxed text-gray-600">
                Gyralis is where communities grow by showing up. Think of it
                like a digital heartbeat—feed it, nurture it, and earn rewards
                as your loop thrives.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button className="tamagotchi-button px-8 py-4 text-lg">
                  Feed the Loop
                </button>
                <button className="tamagotchi-button-secondary px-8 py-4 text-lg">
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right side - Tamagotchi device */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Main device body */}
                <div className="relative h-96 w-80 rounded-3xl bg-gradient-to-b from-pink-300 to-pink-400 shadow-2xl">
                  {/* Device screen */}
                  <div className="absolute left-8 right-8 top-12 h-48 overflow-hidden rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-yellow-200 to-yellow-300">
                    {/* Digital pet */}
                    <div className="flex h-full items-center justify-center">
                      <div className="pulse-glow relative h-24 w-24 rounded-full bg-green-400">
                        {/* Eyes */}
                        <div className="absolute left-4 top-6 h-3 w-3 rounded-full bg-black"></div>
                        <div className="absolute right-4 top-6 h-3 w-3 rounded-full bg-black"></div>
                        {/* Mouth */}
                        <div className="absolute bottom-6 left-1/2 h-4 w-8 -translate-x-1/2 transform rounded-full border-b-4 border-black"></div>
                        {/* Cheeks */}
                        <div className="absolute left-1 top-8 h-4 w-4 rounded-full bg-pink-300 opacity-80"></div>
                        <div className="absolute right-1 top-8 h-4 w-4 rounded-full bg-pink-300 opacity-80"></div>
                      </div>
                    </div>
                  </div>

                  {/* Device buttons */}
                  <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 transform gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-400 shadow-lg"></div>
                    <div className="h-12 w-12 rounded-full bg-orange-400 shadow-lg"></div>
                    <div className="h-12 w-12 rounded-full bg-orange-400 shadow-lg"></div>
                  </div>

                  {/* Device details */}
                  <div className="absolute left-1/2 top-4 flex -translate-x-1/2 transform gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  </div>
                </div>

                {/* Decorative gears and elements */}
                <div className="floating absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-400 opacity-80"></div>
                <div
                  className="floating absolute -bottom-8 -left-8 h-12 w-12 bg-orange-400 opacity-80"
                  style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                ></div>
                <div
                  className="floating absolute -right-12 top-1/2 h-8 w-8 bg-teal-400 opacity-80"
                  style={{
                    clipPath:
                      "polygon(30% 0%, 0% 50%, 30% 100%, 70% 100%, 100% 50%, 70% 0%)",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* <div className="tamagotchi-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search loops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none font-body"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "All" | "Super" | "Normal")}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none font-body"
            >
              <option value="All">All Types</option>
              <option value="Super">Super Loops</option>
              <option value="Normal">Normal Loops</option>
            </select>
          </div>
        </div> */}

        {/* Loop cards */}
        {/* <div className="grid gap-6">
          {filteredLoopCards.length > 0 ? (
            filteredLoopCards.map((card) => <LoopCard key={card.id} card={card} onBalanceUpdate={updateLoopBalance} />)
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-xl text-gray-500">No loops found matching your criteria.</p>
            </div>
          )}
        </div> */}
      </div>
    </div>
  )
}
