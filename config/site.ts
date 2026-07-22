// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Site
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
interface SiteConfig {
  name: string
  title: string
  emoji: string
  description: string
  localeDefault: string
  links: {
    docs: string
    discord: string
    twitter: string
    github: string
  }
}

export const SITE_CANONICAL = "https://www.gyralis.xyz/"

export const siteConfig: SiteConfig = {
  name: "Gyralis",
  title: "",
  emoji: "⚡",
  description:
    "Gyralis is for DAOs and Web3 protocols that want to build trust and incentivize real participation",
  localeDefault: "en",
  links: {
    docs: "",
    discord: "",
    twitter: "https://x.com/gyralis_xyz",
    github: "https://github.com/orgs/Gyralis/repositories",
  },
}

export const DEPLOY_URL = ""
