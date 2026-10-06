import { parseAbi } from "viem"

export const standardLoopAbi = parseAbi([
  "function getLoopDetails() view returns (address token, uint256 periodLength, uint256 percentPerPeriod, uint256 firstPeriodStart)",
  "function getCurrentPeriod() view returns (uint256)",
  "function getCurrentPeriodData() view returns (uint256 totalRegisteredUsers, uint256 maxPayout)",
  "function getClaimerStatus(address claimer) view returns (bool isRegistered, bool hasClaimed)",
  "function getPeriodIndividualPayout(uint256 periodNumber) view returns (uint256)",
  "function claim()",
  "function claimAndRegister(bytes signature)",
])
