import { Game } from "@prisma/client";

/**
 * Builds a URL query string for game comparison
 * @param selectedGames Array of currently selected games
 * @param selectedVersionsMap Map of game IDs to their selected version IDs
 * @param selectedTier Currently selected tier (if any)
 * @returns Formatted URL query string
 */
export function buildGameCompareUrl(
  selectedGames: Game[],
  selectedVersionsMap: Record<number, number>,
  selectedTier: { tierId: number } | null
): string {
  if (selectedGames.length === 0) {
    return "/";
  }

  const gameIds = selectedGames.map((g) => g.id).join(",");

  // Only include versions for games that are selected
  const versionIds = selectedGames
    .map((g) => selectedVersionsMap[g.id] || 0)
    .join(",");

  // Include tierId in URL if a tier is selected
  const tierIdParam = selectedTier ? `&tierId=${selectedTier.tierId}` : "";

  return `?games=${gameIds}&versions=${versionIds}${tierIdParam}`;
}
