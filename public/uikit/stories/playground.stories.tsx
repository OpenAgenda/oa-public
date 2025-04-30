import { LuArrowRight } from 'react-icons/lu';
import {
  Avatar,
  Box,
  Button,
  Code,
  Container,
  For,
  HStack,
  Kbd,
  SimpleGrid,
  Spinner,
  Stack,
  Tabs,
} from '../src';
import {
  Blockquote,
  Checkbox,
  ProgressCircleRing,
  ProgressCircleRoot,
  Radio,
  RadioGroup,
  Rating,
  Slider,
  Switch,
} from '../src/snippets';
import Provider from './decorators/Provider';
import * as Playground from './components/Playground';
import { ThemePanel } from './components/ThemePanel';

export default {
  title: 'OpenAgenda',
  decorators: [Provider],
};

const buttonVariants = [
  'solid',
  'outline',
  'ghost',
  'subtle',
  'surface',
  'plain',
  'link',
] as const;

export function TheStory() {
  return (
    <Container
      display="flex"
      gap="10"
      maxW="8xl"
      bg="bg.subtle"
      borderRadius="lg"
    >
      <Box
        maxW="5xl"
        width="full"
        flex="1"
        minHeight="var(--content-height)"
        overflow="auto"
      >
        <Playground.Section>
          <Playground.SectionTitle id="button">Button</Playground.SectionTitle>
          <Playground.SectionContent>
            <Playground.DemoList
              items={[
                {
                  label: 'Accent Colors',
                  component: (
                    <HStack>
                      <For each={buttonVariants}>
                        {(variant) => (
                          <Button key={variant} variant={variant}>
                            Click <LuArrowRight />
                          </Button>
                        )}
                      </For>
                    </HStack>
                  ),
                },
                {
                  label: 'Gray',
                  component: (
                    <HStack colorPalette="gray">
                      <For each={buttonVariants}>
                        {(variant) => (
                          <Button key={variant} variant={variant}>
                            Click <LuArrowRight />
                          </Button>
                        )}
                      </For>
                    </HStack>
                  ),
                },
              ]}
            />
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="code">Code</Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack wrap="wrap" gap="4">
              <For each={['subtle', 'surface', 'outline', 'solid']}>
                {(variant) => (
                  <Code size="md" variant={variant} key={variant}>
                    console.log()
                  </Code>
                )}
              </For>
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="avatar">Avatar</Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack wrap="wrap" gap="4">
              <For each={['subtle', 'solid']}>
                {(variant) => (
                  <HStack key={variant}>
                    <Avatar.Root variant={variant} size="lg" shape="rounded">
                      <Avatar.Image src="https://bit.ly/sage-adebayo" />
                      <Avatar.Fallback name="Sage Adebayo" />
                    </Avatar.Root>
                    <Avatar.Root variant={variant} size="lg" shape="rounded">
                      <Avatar.Fallback name="Dan Abramov" />
                    </Avatar.Root>
                    <Avatar.Root variant={variant} size="lg" shape="rounded">
                      <Avatar.Fallback />
                    </Avatar.Root>
                  </HStack>
                )}
              </For>
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="tabs">Tabs</Playground.SectionTitle>
          <Playground.SectionContent>
            <SimpleGrid columns={2} gapX="4" gapY="8">
              <For each={['line', 'subtle', 'enclosed', 'outline']}>
                {(variant) => (
                  <HStack key={variant}>
                    <Tabs.Root variant={variant} defaultValue="components">
                      <Tabs.List>
                        <Tabs.Trigger value="components">
                          Components
                        </Tabs.Trigger>
                        <Tabs.Trigger value="hooks">Hooks</Tabs.Trigger>
                        <Tabs.Trigger value="utilities">Utilities</Tabs.Trigger>
                      </Tabs.List>
                    </Tabs.Root>
                  </HStack>
                )}
              </For>
            </SimpleGrid>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="checkbox">
            Checkbox
          </Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack wrap="wrap" gap="8">
              <For each={['solid', 'outline', 'subtle']}>
                {(variant) => (
                  <Stack key={variant} gap="5">
                    <Checkbox variant={variant}>Accept terms</Checkbox>
                    <Checkbox defaultChecked variant={variant}>
                      Accept terms
                    </Checkbox>
                  </Stack>
                )}
              </For>
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        {/* <Playground.Section> */}
        {/*   <Playground.SectionTitle id="pagination"> */}
        {/*     Pagination */}
        {/*   </Playground.SectionTitle> */}
        {/*   <Playground.SectionContent> */}
        {/*     <PaginationBasic /> */}
        {/*   </Playground.SectionContent> */}
        {/* </Playground.Section> */}

        <Playground.Section>
          <Playground.SectionTitle id="radio">Radio</Playground.SectionTitle>
          <Playground.SectionContent>
            <Stack wrap="wrap" gap="6">
              <For each={['solid', 'outline', 'subtle']}>
                {(variant) => (
                  <RadioGroup
                    defaultValue="two"
                    variant={variant}
                    key={variant}
                  >
                    <HStack gap="5">
                      <Radio value="one">Radio one</Radio>
                      <Radio value="two">Radio second</Radio>
                    </HStack>
                  </RadioGroup>
                )}
              </For>
            </Stack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="rating">Rating</Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack wrap="wrap" gap="8">
              <Rating defaultValue={3} size="sm" />
              <Rating defaultValue={3} size="sm" colorPalette="primary" />
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="switch">Switch</Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack wrap="wrap" gap="8">
              <Switch />
              <Switch defaultChecked />
              <Switch defaultChecked colorPalette="primary" />
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="blockquote">
            Blockquote
          </Playground.SectionTitle>
          <Playground.SectionContent>
            <Stack gap="8">
              <For each={['subtle', 'solid']}>
                {(variant) => (
                  <Blockquote
                    key={variant}
                    showDash
                    cite="Uzumaki Naruto"
                    variant={variant}
                  >
                    If anyone thinks he is something when he is nothing, he
                    deceives himself. Each one should test his own actions. Then
                    he can take pride in himself, without comparing himself to
                    anyone else.
                  </Blockquote>
                )}
              </For>
            </Stack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="slider">Slider</Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack gap="8" maxW="400px" w="full">
              <For each={['outline', 'solid']}>
                {(variant) => (
                  <Slider
                    key={variant}
                    flex="1"
                    variant={variant}
                    defaultValue={[50]}
                  />
                )}
              </For>
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="progress-circle">
            Progress Circle
          </Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack gap="8" maxW="400px" w="full">
              <ProgressCircleRoot size="md" value={30}>
                <ProgressCircleRing cap="round" />
              </ProgressCircleRoot>
              <ProgressCircleRoot size="md" value={30} colorPalette="primary">
                <ProgressCircleRing cap="round" />
              </ProgressCircleRoot>
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="kbd">Kbd</Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack gap="4" maxW="400px" w="full">
              <Kbd size="sm">⌘ C</Kbd>
              <Kbd size="md">⌘ C</Kbd>
              <Kbd size="lg">⌘ C</Kbd>
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        <Playground.Section>
          <Playground.SectionTitle id="spinner">
            Spinner
          </Playground.SectionTitle>
          <Playground.SectionContent>
            <HStack gap="8" ps="4">
              <Spinner size="sm" color="colorPalette.solid" />
              <Spinner size="md" color="colorPalette.solid" />
              <Spinner size="lg" color="colorPalette.solid" />
            </HStack>
          </Playground.SectionContent>
        </Playground.Section>

        {/* <Playground.Section> */}
        {/*   <Playground.SectionTitle id="steps">Steps</Playground.SectionTitle> */}
        {/*   <Playground.SectionContent> */}
        {/*     <StepsBasic /> */}
        {/*   </Playground.SectionContent> */}
        {/* </Playground.Section> */}

        {/* <Playground.Section> */}
        {/*   <Playground.SectionTitle id="timeline"> */}
        {/*     Timeline */}
        {/*   </Playground.SectionTitle> */}
        {/*   <Playground.SectionContent> */}
        {/*     <TimelineBasic /> */}
        {/*   </Playground.SectionContent> */}
        {/* </Playground.Section> */}
      </Box>

      <Box pos="sticky" py="8" top="0" hideBelow="md" maxH="max-content">
        <ThemePanel />
      </Box>
    </Container>
  );
}

TheStory.storyName = 'Playground';
