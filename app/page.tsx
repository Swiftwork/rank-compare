import { Suspense } from "react";
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Skeleton,
} from "@chakra-ui/react";
import { GameCompare } from "@/components/game/GameCompare";
import { PrismaClient } from "@prisma/client";

// New data fetching function
async function getGamesData(searchParams: {
  games?: string;
  versions?: string;
  tierId?: string;
}) {
  const prisma = new PrismaClient();

  try {
    // Fetch all games
    const allGames = await prisma.game.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Process selected games from URL params
    const gameIds = searchParams.games?.split(",").map(Number) || [];
    const versionIds = searchParams.versions?.split(",").map(Number) || [];

    // Prepare selected games data structure
    const selectedGames =
      gameIds.length > 0
        ? allGames.filter((game) => gameIds.includes(game.id))
        : [];

    // Prepare versions map
    const gameVersionsMap: Record<number, any[]> = {};
    const selectedVersionsMap: Record<number, number> = {};

    // Fetch game versions for selected games
    if (selectedGames.length > 0) {
      for (let i = 0; i < selectedGames.length; i++) {
        const gameId = selectedGames[i].id;
        const versions = await prisma.gameVersion.findMany({
          where: { gameId },
          orderBy: { date: "desc" },
        });

        gameVersionsMap[gameId] = versions;

        // Set selected version from URL or default to first
        if (i < versionIds.length && versionIds[i] > 0) {
          const versionExists = versions.some((v) => v.id === versionIds[i]);
          selectedVersionsMap[gameId] = versionExists
            ? versionIds[i]
            : versions[0]?.id || 0;
        } else if (versions.length > 0) {
          selectedVersionsMap[gameId] = versions[0].id;
        }
      }
    }

    // Get tier information if requested
    const tierId = searchParams.tierId
      ? parseInt(searchParams.tierId, 10)
      : null;
    let selectedTier = null;

    if (tierId) {
      // Find the tier and its rank
      const ranks = await prisma.rank.findMany({
        include: { tiers: true },
        where: {
          tiers: {
            some: {
              id: tierId,
            },
          },
        },
      });

      if (ranks.length > 0) {
        for (const rank of ranks) {
          const tier = rank.tiers.find((t) => t.id === tierId);
          if (tier) {
            // You'll need to implement getAccumulatedPercentile logic here
            // or move it to the client component
            selectedTier = {
              tierId: tier.id,
              percentile: tier.percentile,
              rank,
            };
            break;
          }
        }
      }
    }

    return {
      allGames,
      selectedGames,
      gameVersionsMap,
      selectedVersionsMap,
      selectedTier,
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Update the page component to use server-side data fetching
export default async function ComparePage({
  searchParams,
}: {
  searchParams: { games?: string; versions?: string; tierId?: string };
}) {
  const gameData = await getGamesData(await searchParams);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack align="stretch" gap={8}>
        <Box>
          <Heading size="xl" mb={2}>
            Compare Game Ranks
          </Heading>
          <Text color="gray.600" _dark={{ color: "gray.400" }}>
            Search for games and compare their ranking systems side-by-side
          </Text>
        </Box>

        <Suspense fallback={<Skeleton height="600px" />}>
          <GameCompare initialData={gameData} />
        </Suspense>
      </VStack>
    </Container>
  );
}
