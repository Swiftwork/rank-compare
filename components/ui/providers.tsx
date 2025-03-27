'use client';

import { system } from '../theme';

import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';
import { Toaster } from './toaster';

import { ChakraProvider } from '@chakra-ui/react';

export function Providers(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
      <Toaster />
    </ChakraProvider>
  );
}
