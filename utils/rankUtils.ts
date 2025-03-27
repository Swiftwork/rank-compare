import { Rank, RankTier } from '@prisma/client';

type RankWithTiers = Rank & {
  tiers: RankTier[];
};

/**
 * Determines if a tier should be highlighted based on accumulated percentile
 * @param tier The rank tier to check
 * @param rank The rank containing the tier
 * @param selectedTier The currently selected tier with accumulated percentile
 * @param ranks All available ranks
 * @returns Whether the tier should be highlighted
 */
export function shouldHighlightTier(
  tier: RankTier,
  rank: RankWithTiers,
  selectedTier: { accumulatedPercentile: number | null } | null,
  ranks: RankWithTiers[],
): boolean {
  if (
    !selectedTier ||
    selectedTier.accumulatedPercentile === null ||
    selectedTier.accumulatedPercentile === undefined
  ) {
    return false;
  }

  // Get accumulated percentile for this tier
  const tierAccumulated = getAccumulatedPercentile(tier, rank, ranks);

  // Find the tier with the maximum accumulated percentile that doesn't exceed the selected tier's
  let maxAccumulatedPercentile = -1;
  let closestTierId: number | null = null;

  // Loop through all ranks and their tiers to find the closest tier
  for (const r of ranks) {
    for (const t of r.tiers) {
      const accPercentile = getAccumulatedPercentile(t, r, ranks);

      // If this tier's accumulated percentile is less than or equal to the selected tier's
      // and greater than our current max, update the max and closestTierId
      if (
        accPercentile <= selectedTier.accumulatedPercentile &&
        accPercentile > maxAccumulatedPercentile
      ) {
        maxAccumulatedPercentile = accPercentile;
        closestTierId = t.id;
      }
    }
  }

  // Only highlight the tier if it's the closest one
  return tier.id === closestTierId;
}

/**
 * Calculates the accumulated percentile for a specific tier within a rank
 * accounting for all previous ranks and their tiers
 * @param tier The rank tier
 * @param rank The rank containing the tier
 * @param ranks All available ranks
 * @returns The accumulated percentile value
 */
export function getAccumulatedPercentile(
  tier: RankTier,
  rank: RankWithTiers,
  ranks: RankWithTiers[],
): number {
  let accumulated = 0;
  let foundRank = false;
  let foundTier = false;

  // Loop through all ranks
  for (const r of ranks) {
    // Check if we already found our target tier
    if (foundTier) break;

    // If we've reached our target rank
    if (r.id === rank.id) {
      foundRank = true;
    }

    // For each tier in the current rank
    for (const t of r.tiers) {
      // Add the percentile to our accumulated value
      accumulated += t.percentile || 0;

      // If we're in our target rank and found our target tier, we're done
      if (foundRank && t.id === tier.id) {
        foundTier = true;
        break;
      }
    }
  }

  return accumulated;
}
