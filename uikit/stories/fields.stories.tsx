import {
  Box,
  Button,
  Combobox,
  HStack,
  Input,
  Portal,
  SimpleGrid,
  Stack,
  TagsInput,
  Text,
  Textarea,
  createListCollection,
  useFilter,
  useListCollection,
} from '../src';
import {
  Field,
  MarkdownEditor,
  NativeSelectField,
  NativeSelectRoot,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Fields',
  decorators: [Provider],
};

const REGIONS = [
  { value: 'alsace', label: 'Alsace' },
  { value: 'bretagne', label: 'Bretagne' },
  { value: 'occitanie', label: 'Occitanie' },
];

const regions = createListCollection({ items: REGIONS });

interface StateProps {
  invalid?: boolean;
  disabled?: boolean;
}

function RegionSelect({ invalid, disabled }: StateProps) {
  return (
    <SelectRoot collection={regions} invalid={invalid} disabled={disabled}>
      <SelectTrigger>
        <SelectValueText placeholder="Pick a region" />
      </SelectTrigger>
      <SelectContent>
        {regions.items.map((region) => (
          <SelectItem key={region.value} item={region}>
            {region.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

function RegionNativeSelect() {
  return (
    <NativeSelectRoot>
      <NativeSelectField defaultValue="">
        <option value="">Pick a region</option>
        {REGIONS.map((region) => (
          <option key={region.value} value={region.value}>
            {region.label}
          </option>
        ))}
      </NativeSelectField>
    </NativeSelectRoot>
  );
}

function RegionCombobox({ invalid, disabled }: StateProps) {
  const { contains } = useFilter({ sensitivity: 'base' });
  const { collection, filter } = useListCollection({
    initialItems: REGIONS,
    filter: contains,
  });

  return (
    <Combobox.Root
      collection={collection}
      invalid={invalid}
      disabled={disabled}
      openOnClick
      width="full"
      onInputValueChange={({ inputValue }) => filter(inputValue)}
    >
      <Combobox.Control>
        <Combobox.Input placeholder="Type to find a region" />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No region</Combobox.Empty>
            {collection.items.map((region) => (
              <Combobox.Item key={region.value} item={region}>
                {region.label}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}

function Tags({ invalid, disabled }: StateProps) {
  return (
    <TagsInput.Root
      width="full"
      defaultValue={['pdf', 'docx']}
      invalid={invalid}
      disabled={disabled}
    >
      <TagsInput.Control>
        <TagsInput.Items />
        <TagsInput.Input placeholder="Add an extension" />
      </TagsInput.Control>
    </TagsInput.Root>
  );
}

// Every field where a value is typed or picked, side by side: they share one
// frame (`theme/recipes/fieldFrame.ts`) — border, corners, height and inset —
// and must read as one family. Tab through them to see the focus each takes.
export function EveryField() {
  return (
    <Box bg="bg" p="8">
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" maxW="4xl">
        <Field label="Input" helperText="A line of text">
          <Input placeholder="The title of your event" />
        </Field>
        <Field label="Native select">
          <RegionNativeSelect />
        </Field>
        <Field label="Select">
          <RegionSelect />
        </Field>
        <Field label="Combobox">
          <RegionCombobox />
        </Field>
        <Field label="Textarea">
          <Textarea placeholder="A few lines" rows={3} />
        </Field>
        <Field label="Tags input">
          <Tags />
        </Field>
        <Field label="Markdown editor">
          <MarkdownEditor placeholder="A text with headings and lists" />
        </Field>
      </SimpleGrid>
    </Box>
  );
}

// Refused: the border reads twice as thick, in the red of the message under
// it, on every kind of field
export function Refused() {
  return (
    <Box bg="bg" p="8">
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" maxW="4xl">
        <Field label="Input" invalid errorText="Required">
          <Input />
        </Field>
        <Field label="Native select" invalid errorText="Required">
          <RegionNativeSelect />
        </Field>
        <Field label="Select" invalid errorText="Required">
          <RegionSelect invalid />
        </Field>
        <Field label="Combobox" invalid errorText="Required">
          <RegionCombobox invalid />
        </Field>
        <Field label="Textarea" invalid errorText="Required">
          <Textarea rows={3} />
        </Field>
        <Field label="Tags input" invalid errorText="Required">
          <Tags invalid />
        </Field>
        <Field label="Markdown editor" invalid errorText="Required">
          <MarkdownEditor />
        </Field>
      </SimpleGrid>
    </Box>
  );
}

export function Disabled() {
  return (
    <Box bg="bg" p="8">
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" maxW="4xl">
        <Field label="Input" disabled>
          <Input defaultValue="Fête de la musique" />
        </Field>
        <Field label="Native select" disabled>
          <RegionNativeSelect />
        </Field>
        <Field label="Select" disabled>
          <RegionSelect disabled />
        </Field>
        <Field label="Combobox" disabled>
          <RegionCombobox disabled />
        </Field>
        <Field label="Textarea" disabled>
          <Textarea rows={3} defaultValue="A few lines" />
        </Field>
        <Field label="Tags input" disabled>
          <Tags disabled />
        </Field>
        <Field label="Markdown editor" disabled>
          <MarkdownEditor defaultValue="A **text**" />
        </Field>
      </SimpleGrid>
    </Box>
  );
}

// A field and a button of the same `size` are the same height, and line up
// on a shared line — left to their defaults too, which are both `sm`.
export function BesideAButton() {
  return (
    <Box bg="bg" p="8">
      <Stack gap="6" maxW="xl">
        <Stack gap="2">
          <Text color="fg.muted">Defaults</Text>
          <HStack align="flex-start">
            <Input placeholder="Search" />
            <Button>Search</Button>
          </HStack>
        </Stack>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Stack key={size} gap="2">
            <Text color="fg.muted">Both `{size}`</Text>
            <HStack align="flex-start">
              <Input size={size} placeholder="Search" />
              <Button size={size}>Search</Button>
            </HStack>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
