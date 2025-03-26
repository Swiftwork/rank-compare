"use client";

import { Box, Image, Heading, VStack, Flex } from "@chakra-ui/react";
import { Game, GameVersion, Rank, RankTier } from "@prisma/client";
import { VersionSelector } from "./VersionSelector";
import { RankBar } from "./RankBar";

interface GameRowProps {
  game: Game;
  versions: GameVersion[];
  selectedVersionId: number | null;
  onVersionChange: (versionId: number) => void;
  onTierSelect?: (tier: RankTier, rank: Rank) => void;
  selectedTier?: {
    tierId: number;
    percentile: number | null;
    accumulatedPercentile?: number | null;
  };
}

export function GameRow({
  game,
  versions,
  selectedVersionId,
  onVersionChange,
  onTierSelect,
  selectedTier,
}: GameRowProps) {
  return (
    <Flex
      width="100%"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      shadow="md"
      direction={{ base: "column", md: "row" }}
      p={4}
      gap={4}
      alignItems={{ base: "stretch", md: "center" }}
    >
      {/* Game Banner */}
      <Box
        width={{ base: "100%", md: "120px" }}
        height={{ base: "80px", md: "80px" }}
        flexShrink={0}
      >
        {game.banner ? (
          <Image
            src={game.banner}
            alt={game.name}
            objectFit="cover"
            borderRadius="md"
            width="100%"
            height="100%"
          />
        ) : (
          <Box
            bg="gray.200"
            _dark={{ bg: "gray.700" }}
            width="100%"
            height="100%"
            borderRadius="md"
          />
        )}
      </Box>

      {/* Game Info and Version Selector */}
      <VStack
        align="flex-start"
        gap={2}
        width={{ base: "100%", md: "200px" }}
        flexShrink={0}
      >
        <Heading size="md">{game.name}</Heading>
        <VersionSelector
          versions={versions}
          value={selectedVersionId}
          onValueChange={onVersionChange}
        />
      </VStack>

      {/* Rank Bar - taking the remaining space */}
      <Box flex="1">
        {selectedVersionId && (
          <RankBar
            versionId={selectedVersionId}
            selectedTier={selectedTier}
            onTierSelect={onTierSelect}
          />
        )}
      </Box>
    </Flex>
  );
}
