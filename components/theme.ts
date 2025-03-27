import { defaultConfig } from "@chakra-ui/react";
import { createSystem } from "@chakra-ui/react";
import { defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {},
});

export const system = createSystem(defaultConfig, config);
