'use client';

import { Box, Flex, Image, Tag } from '@chakra-ui/react';
import { Game } from '@prisma/client';

interface GameTagProps {
  game: Game;
  onRemove: (gameId: number) => void;
}

export function GameTag({ game, onRemove }: GameTagProps) {
  return (
    <Tag.Root
      borderRadius="full"
      colorPalette="blue"
      px={3}
      py={1}
      size="lg"
      variant="solid">
      <Flex align="center">
        {game.banner && (
          <Box asChild>
            <Image
              alt={game.name}
              borderRadius="full"
              boxSize="20px"
              mr={2}
              objectFit="cover"
              src={game.banner}
            />
          </Box>
        )}
        <Tag.Label>{game.name}</Tag.Label>
        <Tag.CloseTrigger onClick={() => onRemove(game.id)} />
      </Flex>
    </Tag.Root>
  );
}
