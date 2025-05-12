'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  Circle,
  HStack,
  RadioCard,
  Stack,
  Text,
  useChakraContext,
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { RadioCardItem, RadioCardRoot, Tooltip } from '../../src/snippets';

const accentColors = [
  // oa colors
  'primary',
  'oaGray',
  'warning',
  'danger',
  'darkPurple',
  'institTheme.blue',
  'institTheme.purple',
  'institTheme.darkPink',
  'institTheme.blueGrey',
  // basics
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
];

const radiiMap: Record<string, Record<string, string>> = {
  none: {
    l1: 'none',
    l2: 'none',
    l3: 'none',
  },
  xs: {
    l1: 'radii.2xs',
    l2: 'radii.xs',
    l3: 'radii.sm',
  },
  sm: {
    l1: 'radii.xs',
    l2: 'radii.sm',
    l3: 'radii.md',
  },
  md: {
    l1: 'radii.sm',
    l2: 'radii.md',
    l3: 'radii.lg',
  },
  lg: {
    l1: 'radii.md',
    l2: 'radii.lg',
    l3: 'radii.xl',
  },
  xl: {
    l1: 'radii.lg',
    l2: 'radii.xl',
    l3: 'radii.2xl',
  },
  '2xl': {
    l1: 'radii.xl',
    l2: 'radii.2xl',
    l3: 'radii.3xl',
  },
};

export function ThemePanel() {
  const system = useChakraContext();
  const [accentColor, setAccentColor] = useState('primary');
  const [radius, setRadius] = useState('sm');

  const radiiTokens = Object.fromEntries(
    Object.entries(radiiMap[radius]).map(([key, value]) => [
      key,
      system.token(value, value),
    ]),
  );

  return (
    <>
      <Global
        styles={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: system.css({ colorPalette: accentColor }) as any,
          html: {
            '--oa-radii-l1': radiiTokens.l1,
            '--oa-radii-l2': radiiTokens.l2,
            '--oa-radii-l3': radiiTokens.l3,
          },
        }}
      />

      <Card.Root variant="elevated" bg="bg.panel" maxW="sm">
        <Card.Header>
          <HStack justify="space-between">
            <Text fontWeight="semibold">Theme Panel</Text>
            {/* <ColorModeButton colorPalette="gray" /> */}
          </HStack>
        </Card.Header>
        <Card.Body gap="8" alignItems="stretch">
          <Stack gap="3">
            <Text fontWeight="medium" textStyle="sm">
              Color Palette
            </Text>
            <RadioCardRoot
              flex="1"
              size="sm"
              defaultValue={accentColor}
              onValueChange={(details) => setAccentColor(details.value)}
            >
              <HStack wrap="wrap" maxW="342px" gap="2">
                {accentColors.map((color) => (
                  <RadioCard.Item
                    rounded="md"
                    flex="0"
                    key={color}
                    value={color}
                  >
                    <RadioCard.ItemHiddenInput />
                    <Tooltip content={color} openDelay={0} closeDelay={0}>
                      <RadioCard.ItemControl>
                        <Circle size="4" bg={`${color}.solid`} />
                      </RadioCard.ItemControl>
                    </Tooltip>
                  </RadioCard.Item>
                ))}
              </HStack>
            </RadioCardRoot>
          </Stack>

          <Stack gap="3">
            <Text fontWeight="medium" textStyle="sm">
              Radius
            </Text>
            <RadioCardRoot
              size="sm"
              orientation="vertical"
              align="center"
              defaultValue={radius}
              onValueChange={(details) => setRadius(details.value)}
            >
              <HStack wrap="wrap" gap="2">
                {Object.keys(radiiMap).map((radii) => (
                  <RadioCardItem
                    flex="0"
                    minW="60px"
                    rounded="md"
                    indicator={null}
                    label={radii}
                    icon={(
                      <Box
                        boxSize="6"
                        bg="red/10"
                        roundedTopLeft={radii}
                        borderTopWidth="2px"
                        borderStartWidth="2px"
                        borderColor="red"
                      />
                    )}
                    key={radii}
                    value={radii}
                  />
                ))}
              </HStack>
            </RadioCardRoot>
          </Stack>
        </Card.Body>
      </Card.Root>
    </>
  );
}
