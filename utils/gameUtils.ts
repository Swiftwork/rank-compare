import { toaster } from '@/components/ui/toaster';
import { Game, GameVersion } from '@prisma/client';

/**
 * Fetches all versions for a specific game from the API
 * @param gameId The ID of the game to fetch versions for
 * @returns A promise resolving to the game versions
 */
export async function fetchVersionsForGame(
  gameId: number,
): Promise<GameVersion[]> {
  try {
    const response = await fetch(`/api/games/${gameId}/versions`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch versions for game ${gameId}:`, error);
    toaster.error({
      title: 'Error fetching game versions',
      duration: 3000,
    });
    return [];
  }
}

/**
 * Updates the version selections map when removing a game
 * @param gameId The ID of the game being removed
 * @param currentMap The current map of game ID to version ID
 * @returns Updated version map with the game entry removed
 */
export function removeGameFromVersionMap(
  gameId: number,
  currentMap: Record<number, number>,
): Record<number, number> {
  const updated = { ...currentMap };
  delete updated[gameId];
  return updated;
}
