import { base } from "viem/chains"

// Keep approved streaming-loop sources isolated from standard Loop contracts.
export const superLoops = {
  "markee-gardens": {
    name: "Markee Gardens",
    address: "0x213310e1dbD6991cD488AB247c81faD82CD88E7A",
    chain: base,
    contractType: "superLoop",
  },
}
