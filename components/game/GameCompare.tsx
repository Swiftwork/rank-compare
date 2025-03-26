"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  VStack,
  Box,
  Text,
  Wrap,
  WrapItem,
  Center,
  Spinner,
} from "@chakra-ui/react";
import SearchBar from "../ui/SearchBar";
import { GameTag } from "../ui/GameTag";
import { Game, GameVersion, Rank, RankTier } from "@prisma/client";
import { toaster } from "../ui/toaster";
import { GameRow } from "./GameRow";
import {
  fetchVersionsForGame,
  removeGameFromVersionMap,
} from "@/utils/gameUtils";
import { buildGameCompareUrl } from "@/utils/urlUtils";

type GameCompareProps = {
  initialData: {
    allGames: Game[];
    selectedGames: Game[];
    gameVersionsMap: Record<number, GameVersion[]>;
    selectedVersionsMap: Record<number, number>;
    selectedTier: {
      tierId: number;
      percentile: number | null;
      rank: Rank;
    } | null;
  };
};

export function GameCompare({ initialData }: GameCompareProps) {
  const router = useRouter();

  // Initialize state from server data
  const [games, setGames] = useState<Game[]>(initialData.allGames);
  const [selectedGames, setSelectedGames] = useState<Game[]>(
    initialData.selectedGames
  );
  const [gameVersionsMap, setGameVersionsMap] = useState<
    Record<number, GameVersion[]>
  >(initialData.gameVersionsMap);
  const [selectedVersionsMap, setSelectedVersionsMap] = useState<
    Record<number, number>
  >(initialData.selectedVersionsMap);
  const [loading, setLoading] = useState(false);

  // Using the server-provided selectedTier or null
  const [selectedTier, setSelectedTier] = useState<{
    tierId: number;
    percentile: number | null;
    accumulatedPercentile?: number | null;
    rank: Rank;
  } | null>(initialData.selectedTier);

  // Update URL when selections change
  useEffect(() => {
    if (selectedGames.length === 0) {
      // Clear URL params if no games selected
      router.replace("/");
      return;
    }

    const newUrl = buildGameCompareUrl(
      selectedGames,
      selectedVersionsMap,
      selectedTier
    );
    router.replace(newUrl);
  }, [selectedGames, selectedVersionsMap, selectedTier, router]);

  const handleGameSelect = (game: Game) => {
    if (!selectedGames.some((g) => g.id === game.id)) {
      setSelectedGames((prev) => [...prev, game]);

      // If we don't have versions for this game yet, fetch them
      if (!gameVersionsMap[game.id]) {
        fetchGameVersions(game.id);
      }
    }
  };

  const fetchGameVersions = async (gameId: number) => {
    const data = await fetchVersionsForGame(gameId);

    setGameVersionsMap((prev) => ({
      ...prev,
      [gameId]: data,
    }));

    if (data.length > 0) {
      setSelectedVersionsMap((prev) => ({
        ...prev,
        [gameId]: data[0].id,
      }));
    }
  };

  const handleGameRemove = (gameId: number) => {
    setSelectedGames((prev) => prev.filter((g) => g.id !== gameId));
    // Use the utility function to clean up the version selection
    setSelectedVersionsMap((prev) => removeGameFromVersionMap(gameId, prev));
  };

  const handleVersionChange = (gameId: number, versionId: number) => {
    setSelectedVersionsMap((prev) => ({
      ...prev,
      [gameId]: versionId,
    }));
  };

  // Update the tier selection handler
  const handleTierSelect = (tier: RankTier, rank: Rank) => {
    if (selectedTier && selectedTier.tierId === tier.id) {
      // Deselect if clicking the same tier
      setSelectedTier(null);
    } else {
      // Check if the tier has accumulatedPercentile added by our RankBar
      const accumulatedPercentile = (tier as any).accumulatedPercentile;

      // Select the new tier with accumulated percentile
      setSelectedTier({
        tierId: tier.id,
        percentile: tier.percentile,
        accumulatedPercentile: accumulatedPercentile,
        rank: rank,
      });
    }
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <VStack gap={4} align="stretch">
          <SearchBar games={games} onSelect={handleGameSelect} />

          <Wrap gap={2}>
            {selectedGames.map((game) => (
              <WrapItem key={game.id}>
                <GameTag game={game} onRemove={handleGameRemove} />
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      </Box>

      {selectedGames.length > 0 ? (
        <VStack gap={4} align="stretch">
          {selectedGames.map((game) => (
            <GameRow
              key={game.id}
              game={game}
              versions={gameVersionsMap[game.id] || []}
              selectedVersionId={selectedVersionsMap[game.id] || null}
              onVersionChange={(versionId) =>
                handleVersionChange(game.id, versionId)
              }
              onTierSelect={handleTierSelect}
              selectedTier={
                selectedTier
                  ? {
                      tierId: selectedTier.tierId,
                      percentile: selectedTier.percentile,
                      accumulatedPercentile: selectedTier.accumulatedPercentile,
                    }
                  : undefined
              }
            />
          ))}
        </VStack>
      ) : (
        <Center py={10}>
          <Text color="gray.500">
            Search and select games to compare their ranking systems
          </Text>
        </Center>
      )}
    </VStack>
  );
}
