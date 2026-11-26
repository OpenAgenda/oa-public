import { Box, Stack, Link, createListCollection } from '../src';
import {
  Checkbox,
  FileUploadButton,
  FileUploadRoot,
  FormSection,
  LinkButton,
  Radio,
  RadioGroup,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/FormSection',
  decorators: [Provider],
};

const statuses = createListCollection({
  items: [
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'full', label: 'Full' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
});

// A long form split into blocks on the page background, each with its title;
// radios and checkboxes carry their hint as a `description`, aligned with the
// label and dimmed with it when disabled.
export function Default() {
  return (
    <Box bg="bg.muted" p="8">
      <Stack gap="6" maxW="3xl">
        <FormSection title="Contribution">
          <RadioGroup defaultValue="open">
            <Stack gap="3">
              <Radio value="open" description="Anyone can add events">
                Open
              </Radio>
              <Radio value="closed" description="No new contributions">
                Closed
              </Radio>
            </Stack>
          </RadioGroup>
          <Checkbox mt="4" description="Leave unchecked to moderate them first">
            Contributions are published by default
          </Checkbox>
          <Checkbox mt="3" disabled description="Its hint is dimmed with it">
            A disabled checkbox
          </Checkbox>
        </FormSection>

        <FormSection title="Statuses">
          {/* `triggerProps` reach the button itself */}
          <SelectRoot multiple collection={statuses} defaultValue={['full']}>
            <SelectTrigger triggerProps={{ 'aria-describedby': 'hint' }}>
              <SelectValueText placeholder="No status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.items.map((item) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </FormSection>

        <FormSection>
          <Stack gap="4" align="flex-start">
            <FileUploadRoot accept="image/*">
              <FileUploadButton>Choose</FileUploadButton>
            </FileUploadRoot>
            {/* An `a`: it navigates, and is read as a link */}
            <LinkButton href="https://openagenda.com" variant="outline">
              View the agenda
            </LinkButton>
            <Link href="https://openagenda.com">A plain link</Link>
          </Stack>
        </FormSection>
      </Stack>
    </Box>
  );
}

Default.storyName = 'FormSection';
