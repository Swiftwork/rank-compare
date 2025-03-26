"use client";

import { Tag, Image, Flex } from "@chakra-ui/react";
import { Game } from "@prisma/client";

interface GameTagProps {
  game: Game;
  onRemove: (gameId: number) => void;
}

export function GameTag({ game, onRemove }: GameTagProps) {
  return (
    <Tag.Root
      size="lg"
      borderRadius="full"
      variant="solid"
      colorScheme="blue"
      py={1}
      px={3}
    >
      <Flex align="center">
        {game.banner && (
          <Image
            src={game.banner}
            alt={game.name}
            boxSize="20px"
            mr={2}
            borderRadius="full"
            objectFit="cover"
          />
        )}
        <Tag.Label>{game.name}</Tag.Label>

        <Tag.EndElement>
          <Tag.CloseTrigger onClick={() => onRemove(game.id)} />
        </Tag.EndElement>
      </Flex>
    </Tag.Root>
  );
}
