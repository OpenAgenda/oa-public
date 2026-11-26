import { useState } from 'react';
import { Code, VStack } from '../src';
import { Field, MarkdownEditor } from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/MarkdownEditor',
  decorators: [Provider],
};

const TEXT = `## Before adding an event

Read the **contribution guide** first, then:

- one event per activity
- a _landscape_ image
- the [booking page](https://openagenda.com) if there is one`;

export function Default() {
  const [value, setValue] = useState(TEXT);
  return (
    <VStack gap="4" align="stretch" maxW="2xl">
      <Field label="Instructions" helperText="Shown above the event form">
        <MarkdownEditor
          value={value}
          onChange={setValue}
          placeholder="Write the instructions"
        />
      </Field>
      <Code whiteSpace="pre-wrap" p="3">
        {value}
      </Code>
    </VStack>
  );
}

export function Empty() {
  return (
    <Field label="Introduction" maxW="2xl">
      <MarkdownEditor placeholder="Write an introduction" />
    </Field>
  );
}

export function Invalid() {
  return (
    <Field label="Instructions" invalid errorText="Too long" maxW="2xl">
      <MarkdownEditor defaultValue={TEXT} />
    </Field>
  );
}

export function Disabled() {
  return (
    <Field label="Instructions" disabled maxW="2xl">
      <MarkdownEditor defaultValue={TEXT} />
    </Field>
  );
}

// The editor in a form: applying a link must not submit it
export function InForm() {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(0);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved((n) => n + 1);
      }}
    >
      <VStack gap="4" align="stretch" maxW="2xl">
        <Field label="Introduction" required>
          <MarkdownEditor value={value} onChange={setValue} />
        </Field>
        <Code whiteSpace="pre-wrap" p="3" data-testid="markdown">
          {value}
        </Code>
        <Code p="3" data-testid="saved">{`Saved ${saved} times`}</Code>
      </VStack>
    </form>
  );
}
