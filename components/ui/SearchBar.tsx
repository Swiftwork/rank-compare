'use client';

import { useState } from 'react';

import { Box, Field, Flex, Image, Input, List, Text } from '@chakra-ui/react';
import { Game } from '@prisma/client';

interface SearchBarProps {
  games: Game[];
  onSelect: (game: Game) => void;
}

export default function SearchBar({ games, onSelect }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box maxW="500px" position="relative" width="full">
      <Field.Root>
        <Input
          placeholder="Search for games..."
          value={searchQuery}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
      </Field.Root>

      {showResults && searchQuery && (
        <Box
          bg="chakra-body-bg"
          borderRadius="md"
          borderWidth="1px"
          boxShadow="md"
          left="0"
          maxH="300px"
          overflowY="auto"
          position="absolute"
          top="full"
          width="full"
          zIndex="dropdown">
          <List.Root gap={2} p={2}>
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <List.Item
                  key={game.id}
                  _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
                  borderRadius="md"
                  cursor="pointer"
                  p={2}
                  onClick={() => {
                    onSelect(game);
                    setSearchQuery('');
                    setShowResults(false);
                  }}>
                  <Flex align="center">
                    {game.banner && (
                      <Image
                        alt={game.name}
                        borderRadius="sm"
                        boxSize="32px"
                        mr={2}
                        objectFit="cover"
                        src={game.banner}
                      />
                    )}
                    <Text>{game.name}</Text>
                  </Flex>
                </List.Item>
              ))
            ) : (
              <List.Item p={2}>
                <Text color="gray.500">No games found</Text>
              </List.Item>
            )}
          </List.Root>
        </Box>
      )}
    </Box>
  );
}
