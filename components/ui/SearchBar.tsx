"use client";

import { useState } from "react";
import {
  Input,
  InputGroup,
  Box,
  Text,
  Flex,
  List,
  Image,
} from "@chakra-ui/react";
import { Game } from "@prisma/client";

interface SearchBarProps {
  games: Game[];
  onSelect: (game: Game) => void;
}

export default function SearchBar({ games, onSelect }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box position="relative" width="100%" maxW="500px">
      <InputGroup>
        <Input
          placeholder="Search for games..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </InputGroup>

      {showResults && searchQuery && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          width="100%"
          bg="chakra-body-bg"
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          zIndex="dropdown"
          maxH="300px"
          overflowY="auto"
        >
          <List.Root gap={2} p={2}>
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <List.Item
                  key={game.id}
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
                  cursor="pointer"
                  onClick={() => {
                    onSelect(game);
                    setSearchQuery("");
                    setShowResults(false);
                  }}
                >
                  <Flex align="center">
                    {game.banner && (
                      <Image
                        src={game.banner}
                        alt={game.name}
                        boxSize="32px"
                        mr={2}
                        objectFit="cover"
                        borderRadius="sm"
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
