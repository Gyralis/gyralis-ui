// Prototype data only. Never use these values for wallet eligibility or claims.
export const demoParticipation = {
  name: "Mati0x",
  totalClaims: 151,
  totalGP: 196,
  currentStreak: 11,
  longestStreak: 17,
  level: 7,
  seasonGP: 1840,
  seasonRank: 38,
}

export type DemoGame = {
  id: string
  type: string
  title: string
  description: string
  status: "Live" | "Upcoming" | "Completed"
  current: number
  target: number
  unit: string
  participants: number
  art: string
}

export const demoGames: DemoGame[] = [
  {
    id: "sprint",
    type: "Sprint",
    title: "30-Day Sprint",
    description: "Claim, keep your streak, and climb the Season leaderboard.",
    status: "Live",
    current: 12,
    target: 30,
    unit: "days",
    participants: 227,
    art: "/images/img_2.png",
  },
  {
    id: "race",
    type: "Claim Race",
    title: "First 50 to 20 claims",
    description: "Show up early. Keep coming back. Reach 20 claims.",
    status: "Live",
    current: 14,
    target: 20,
    unit: "claims",
    participants: 164,
    art: "/images/super_loops_img.png",
  },
  {
    id: "explorer",
    type: "Explorer",
    title: "Find your next Loop",
    description:
      "Participate across five different Loops and explore new communities.",
    status: "Live",
    current: 3,
    target: 5,
    unit: "Loops",
    participants: 118,
    art: "/images/img_1.png",
  },
  {
    id: "marathon",
    type: "Marathon",
    title: "The long game",
    description: "Make participation a habit. Claim on 25 of 30 active days.",
    status: "Live",
    current: 11,
    target: 25,
    unit: "active days",
    participants: 93,
    art: "/images/loop_img.png",
  },
  {
    id: "community",
    type: "Loop Wars",
    title: "Communities in the Loop",
    description:
      "A community challenge built around consistency and claim rate.",
    status: "Upcoming",
    current: 0,
    target: 1,
    unit: "challenge",
    participants: 0,
    art: "/images/img_1.png",
  },
  {
    id: "week",
    type: "Sprint",
    title: "The first seven days",
    description: "A completed preview of a week of recurring participation.",
    status: "Completed",
    current: 7,
    target: 7,
    unit: "days",
    participants: 84,
    art: "/images/loop_img.png",
  },
]

export const demoMilestones = [
  {
    id: "25k",
    title: "25K claims",
    current: 22481,
    target: 25000,
    unit: "claims",
    status: "Active",
    unlock: "The next chapter of community participation.",
  },
  {
    id: "hny",
    title: "500 HNY distributed",
    current: 355,
    target: 500,
    unit: "HNY",
    status: "Active",
    unlock: "Recurring rewards, shared across the ecosystem.",
  },
  {
    id: "loopers",
    title: "250 True Loopers",
    current: 160,
    target: 250,
    unit: "Loopers",
    status: "Active",
    unlock: "A growing community that keeps coming back.",
  },
  {
    id: "10k",
    title: "10K claims",
    current: 10000,
    target: 10000,
    unit: "claims",
    status: "Completed",
    unlock: "Our first ten thousand moments of participation.",
  },
  {
    id: "15k",
    title: "15K claims",
    current: 15000,
    target: 15000,
    unit: "claims",
    status: "Completed",
    unlock: "Another milestone, made together.",
  },
  {
    id: "50k",
    title: "50K claims",
    current: 22481,
    target: 50000,
    unit: "claims",
    status: "Upcoming",
    unlock: "The next collective target after 25K claims.",
  },
] as const
