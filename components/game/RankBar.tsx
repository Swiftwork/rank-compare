"use client";

import { useEffect, useState, useRef } from "react";
import { Box, HStack, Text, Image, VStack, Skeleton } from "@chakra-ui/react";
import { Rank, RankTier } from "@prisma/client";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import {
  shouldHighlightTier,
  getAccumulatedPercentile,
  isSelectedTier,
} from "@/utils/rankUtils";

type RankWithTiers = Rank & {
  tiers: RankTier[];
  percentile?: number;
};

type RankBarProps = {
  versionId: number;
  onTierSelect: (tier: RankTier, rank: Rank) => void;
  selectedTier: {
    tierId: number;
    percentile: number | null;
    accumulatedPercentile?: number | null;
    rank: Rank;
  } | null;
  initialRanks?: RankWithTiers[]; // New prop for server-fetched data
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
        console.error("Failed to fetch ranks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialRanks || ranks.length === 0) {
      fetchRanks();
    }
  }, [versionId, initialRanks]);

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
        ranks
      );

      // Create a new tier object with the accumulated percentile
      const tierWithAccumulated = {
        ...tier,
        accumulatedPercentile,
      };

      onTierSelect(tierWithAccumulated as RankTier, rank);

      // Update URL with selected tier ID
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("tierId", tier.id.toString());
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  };

  return (
    <VStack gap={4} align="stretch" ref={componentRef}>
      <Text fontWeight="medium">Ranks</Text>
      <Box
        width="100%"
        height="60px"
        position="relative"
        borderRadius="md"
        overflow="hidden"
      >
        <HStack gap={0} height="100%" width="100%">
          {ranks.map((rank) => {
            // Evenly distribute ranks, ignoring percentile
            const rankWidth = 1 / ranks.length;

            return (
              <Box
                height="100%"
                width={`${rankWidth * 100}%`}
                display="flex"
                position="relative"
              >
                {/* Tiers within the rank - with small gaps */}
                <HStack gap={1} width="100%" height="100%" p={1}>
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
                              ranks
                            )
                          : false;
                      const isSelected = isSelectedTier(tier, selectedTier);

                      return (
                        <Tooltip
                          key={tier.id}
                          content={`${rank.name} ${tier.name}${
                            tier.percentile
                              ? ` (${(tier.percentile * 100).toFixed(2)}%)`
                              : ""
                          }${
                            tier.percentile
                              ? ` - Top ${(getAccumulatedPercentile(tier, rank, ranks) * 100).toFixed(2)}%`
                              : ""
                          }`}
                        >
                          <Box
                            height={
                              isHighlighted || isSelected ? "110%" : "100%"
                            }
                            width={`${(100 - (rank.tiers.length - 1) * 2) / rank.tiers.length}%`}
                            position="relative"
                            borderRadius="sm"
                            bg={isSelected ? "white" : rank.color || "gray.400"}
                            opacity={
                              selectedTier && !isHighlighted && !isSelected
                                ? 0.5
                                : 1
                            }
                            transform={
                              isHighlighted || isSelected
                                ? "translateY(-5%)"
                                : "none"
                            }
                            transition="all 0.2s ease"
                            cursor="pointer"
                            _hover={{ filter: "brightness(1.1)" }}
                            onClick={() => handleTierSelect(tier, rank)}
                          >
                            {tier.badge && (
                              <Image
                                src={tier.badge}
                                alt={`${rank.name} ${tier.name}`}
                                position="absolute"
                                bottom="5px"
                                left="50%"
                                transform="translateX(-50%)"
                                height={
                                  isHighlighted || isSelected ? "35px" : "30px"
                                }
                                transition="height 0.2s ease"
                              />
                            )}
                          </Box>
                        </Tooltip>
                      );
                    })
                  ) : (
                    <Box
                      width="100%"
                      height="100%"
                      position="relative"
                      opacity={selectedTier ? 0.5 : 1}
                    >
                      {rank.badge && (
                        <Image
                          src={rank.badge}
                          alt={rank.name}
                          position="absolute"
                          bottom="5px"
                          left="50%"
                          transform="translateX(-50%)"
                          height="30px"
                        />
                      )}
                    </Box>
                  )}
                </HStack>
              </Box>
            );
          })}
        </HStack>
      </Box>
    </VStack>
  );
}
