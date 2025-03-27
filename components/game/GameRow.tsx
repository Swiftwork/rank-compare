'use client';

import { RankBar } from './RankBar';
import { VersionSelector } from './VersionSelector';

import { Box, Flex, Heading, Image, VStack } from '@chakra-ui/react';
import { Game, GameVersion, Rank, RankTier } from '@prisma/client';

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
      alignItems={{ base: 'stretch', md: 'center' }}
      borderRadius="lg"
      borderWidth="1px"
      direction={{ base: 'column', md: 'row' }}
      gap={4}
      overflow="hidden"
      p={4}
      shadow="md"
      width="full">
      {/* Game Banner */}
      <Box
        flexShrink={0}
        height={{ base: '80px', md: '80px' }}
        width={{ base: '100%', md: '120px' }}>
        {game.banner ? (
          <Image
            alt={game.name}
            borderRadius="md"
            height="full"
            objectFit="cover"
            src={game.banner}
            width="full"
          />
        ) : (
          <Box
            _dark={{ bg: 'gray.700' }}
            bg="gray.200"
            borderRadius="md"
            height="full"
            width="full"
          />
        )}
      </Box>

      {/* Game Info and Version Selector */}
      <VStack
        align="flex-start"
        flexShrink={0}
        gap={2}
        width={{ base: '100%', md: '200px' }}>
        <Heading size="md">{game.name}</Heading>
        <VersionSelector
          value={selectedVersionId}
          versions={versions}
          onValueChange={onVersionChange}
        />
      </VStack>

      {/* Rank Bar - taking the remaining space */}
      <Box flex="1">
        {selectedVersionId && (
          <RankBar
            selectedTier={selectedTier}
            versionId={selectedVersionId}
            onTierSelect={onTierSelect}
          />
        )}
      </Box>
    </Flex>
  );
}
