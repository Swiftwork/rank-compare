"use client";

import { useEffect, useState, useRef } from "react";
import { Box, HStack, Text, Image, VStack, Skeleton } from "@chakra-ui/react";
import { Rank, RankTier } from "@prisma/client";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import {
  shouldHighlightTier,
  getAccumulatedPercentile,
} from "@/utils/rankUtils";

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
      <Box width="full" position="relative" borderRadius="md">
        <HStack gap={0} width="full">
          {ranks.map((rank) => {
            // Evenly distribute ranks, ignoring percentile
            const rankWidth = 1 / ranks.length;

            return (
              <VStack
                gap={1}
                key={rank.id}
                height="full"
                width={`${rankWidth * 100}%`}
                display="flex"
                position="relative"
                flexDirection="column"
              >
                {/* Tiers within the rank - with small gaps */}
                <HStack gap={1} width="full" height="full" p={1}>
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
                      const isSelected = tier.id === selectedTier?.tierId;

                      return (
                        <Tooltip
                          positioning={{
                            placement: "top",
                          }}
                          key={tier.id}
                          content={`${rank.name} ${tier.name}${
                            tier.percentile
                              ? ` (${tier.percentile.toFixed(2)}%)`
                              : ""
                          }${
                            tier.percentile
                              ? ` - Top ${getAccumulatedPercentile(tier, rank, ranks).toFixed(2)}%`
                              : ""
                          }`}
                        >
                          <Box
                            height={12}
                            width={`${(100 - (rank.tiers.length - 1) * 2) / rank.tiers.length}%`}
                            position="relative"
                            borderRadius="sm"
                            bg={rank.color || "gray.400"}
                            opacity={
                              selectedTier && !isHighlighted && !isSelected
                                ? 0.5
                                : 1
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
                            <Text
                              position="absolute"
                              top="2px"
                              left="50%"
                              transform="translateX(-50%)"
                              fontSize="xs"
                              fontWeight="bold"
                              color="gray.900"
                              width="full"
                              textAlign="center"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                              px={1}
                            >
                              {tier.name}
                            </Text>
                          </Box>
                        </Tooltip>
                      );
                    })
                  ) : (
                    <Box
                      width="full"
                      height="full"
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

                <Text
                  textAlign="center"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.600"
                  width="full"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
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
