'use client';

import { useEffect, useRef, useState } from 'react';

import { Tooltip } from '@/components/ui/tooltip';
import {
  getAccumulatedPercentile,
  shouldHighlightTier,
} from '@/utils/rankUtils';

import { Box, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react';
import { Rank, RankTier } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

type RankWithTiers = Rank & {
  tiers: RankTier[];
  percentile?: number;
};

type RankBarProps = {
  versionId: number;
  selectedTier?: {
    tierId: number;
    percentile: number | null;
    accumulatedPercentile?: number | null;
  };
  initialRanks?: RankWithTiers[]; // New prop for server-fetched data
  onTierSelect?: (tier: RankTier, rank: Rank) => void;
};

export function RankBar({
  versionId,
  onTierSelect,
  selectedTier,
  initialRanks,
}: RankBarProps) {
  const [loading, setLoading] = useState(!initialRanks);
  const [ranks, setRanks] = useState<RankWithTiers[]>(initialRanks || []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only fetch ranks if they weren't provided by the server
    // or if the versionId changed
    const fetchRanks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/games/versions/${versionId}/ranks`);
        const data = await response.json();
        setRanks(data);
      } catch (error) {
        console.error('Failed to fetch ranks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialRanks || ranks.length === 0) {
      fetchRanks();
    }
  }, [versionId, initialRanks, ranks.length]);

  if (loading) {
    return <Skeleton height="100px" />;
  }

  if (ranks.length === 0) {
    return <Text color="gray.500">No ranks available for this version</Text>;
  }

  const handleTierSelect = (tier: RankTier, rank: Rank) => {
    if (onTierSelect) {
      // Cast the rank to RankWithTiers since we know it has tiers
      const rankWithTiers = rank as RankWithTiers;

      // Calculate the accumulated percentile up to and including this tier
      const accumulatedPercentile = getAccumulatedPercentile(
        tier,
        rankWithTiers,
        ranks,
      );

      // Create a new tier object with the accumulated percentile
      const tierWithAccumulated = {
        ...tier,
        accumulatedPercentile,
      };

      onTierSelect(tierWithAccumulated as RankTier, rank);

      // Update URL with selected tier ID
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('tierId', tier.id.toString());
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  };

  return (
    <VStack ref={componentRef} align="stretch" gap={4}>
      <Box borderRadius="md" position="relative" width="full">
        <HStack gap={0} width="full">
          {ranks.map((rank) => {
            // Evenly distribute ranks, ignoring percentile
            const rankWidth = 1 / ranks.length;

            return (
              <VStack
                key={rank.id}
                display="flex"
                flexDirection="column"
                gap={1}
                height="full"
                position="relative"
                width={`${rankWidth * 100}%`}>
                {/* Tiers within the rank - with small gaps */}
                <HStack gap={1} height="full" p={1} width="full">
                  {rank.tiers.length > 0 ? (
                    rank.tiers.map((tier) => {
                      const isHighlighted =
                        selectedTier?.accumulatedPercentile !== undefined
                          ? shouldHighlightTier(
                              tier,
                              rank,
                              {
                                accumulatedPercentile:
                                  selectedTier.accumulatedPercentile,
                              },
                              ranks,
                            )
                          : false;
                      const isSelected = tier.id === selectedTier?.tierId;

                      return (
                        <Tooltip
                          key={tier.id}
                          content={`${rank.name} ${tier.name}${
                            tier.percentile
                              ? ` (${tier.percentile.toFixed(2)}%)`
                              : ''
                          }${
                            tier.percentile
                              ? ` - Top ${getAccumulatedPercentile(tier, rank, ranks).toFixed(2)}%`
                              : ''
                          }`}
                          positioning={{
                            placement: 'top',
                          }}>
                          <Box
                            _hover={{ filter: 'brightness(1.1)' }}
                            bg={rank.color || 'gray.400'}
                            borderRadius="sm"
                            cursor="pointer"
                            height={12}
                            opacity={
                              selectedTier && !isHighlighted && !isSelected
                                ? 0.5
                                : 1
                            }
                            position="relative"
                            transition="all 0.2s ease"
                            width={`${(100 - (rank.tiers.length - 1) * 2) / rank.tiers.length}%`}
                            onClick={() => handleTierSelect(tier, rank)}>
                            {tier.badge && (
                              <Image
                                alt={`${rank.name} ${tier.name}`}
                                bottom="5px"
                                height={
                                  isHighlighted || isSelected ? '35px' : '30px'
                                }
                                left="50%"
                                position="absolute"
                                src={tier.badge}
                                transform="translateX(-50%)"
                                transition="height 0.2s ease"
                              />
                            )}
                            <Text
                              color="gray.900"
                              fontSize="xs"
                              fontWeight="bold"
                              left="50%"
                              overflow="hidden"
                              position="absolute"
                              px={1}
                              textAlign="center"
                              textOverflow="ellipsis"
                              top="2px"
                              transform="translateX(-50%)"
                              whiteSpace="nowrap"
                              width="full">
                              {tier.name}
                            </Text>
                          </Box>
                        </Tooltip>
                      );
                    })
                  ) : (
                    <Box
                      height="full"
                      opacity={selectedTier ? 0.5 : 1}
                      position="relative"
                      width="full">
                      {rank.badge && (
                        <Image
                          alt={rank.name}
                          bottom="5px"
                          height="30px"
                          left="50%"
                          position="absolute"
                          src={rank.badge}
                          transform="translateX(-50%)"
                        />
                      )}
                    </Box>
                  )}
                </HStack>

                <Text
                  color="gray.600"
                  fontSize="xs"
                  fontWeight="medium"
                  overflow="hidden"
                  textAlign="center"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  width="full">
                  {rank.name}
                </Text>
              </VStack>
            );
          })}
        </HStack>
      </Box>
    </VStack>
  );
}
