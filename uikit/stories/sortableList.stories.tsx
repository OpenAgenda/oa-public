import { useState } from 'react';
import { Box, Button, IconButton, Text } from '../src';
import { SortableList } from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/SortableList',
  decorators: [Provider],
};

// Dragged by its handles with the mouse, touch or the keyboard (focus a
// handle, Space, the arrows, Space); each row's own buttons show on hover
// and focus
export function Default() {
  const [items, setItems] = useState([
    { id: 'timings', label: 'Dates' },
    { id: 'keywords', label: 'Tags' },
    { id: 'location', label: 'Place' },
    { id: 'status', label: 'Status' },
  ]);
  return (
    <Box maxW="md" p="8">
      <SortableList
        aria-label="Filters"
        items={items}
        onReorder={(ids) =>
          setItems(ids.map((id) => items.find((item) => item.id === id)!))}
        renderActions={(item) => (
          <IconButton
            size="xs"
            variant="ghost"
            aria-label={`Remove ${item.label}`}
            onClick={() => setItems(items.filter((i) => i.id !== item.id))}
          >
            ×
          </IconButton>
        )}
      />
    </Box>
  );
}

Default.storyName = 'SortableList';

// A row may show more than its label: `content` takes its place — here a
// title over a note, with the row's actions always in view — while `label`
// still names the row for its handle and for screen readers. With `dragRows`
// the whole row is dragged with a mouse, and its buttons still answer a click
export function WithContent() {
  const [items, setItems] = useState([
    { id: 'title', label: 'Title', note: 'Short text, required' },
    { id: 'audience', label: 'Audience', note: 'Everyone, Children, Adults' },
    { id: 'day', label: 'Day', note: 'Date' },
  ]);
  return (
    <Box maxW="md" p="8">
      <SortableList
        aria-label="Fields"
        // dragged from anywhere on the row: a click on « Remove » still
        // removes
        dragRows
        items={items.map((item) => ({
          id: item.id,
          label: item.label,
          content: (
            <Box>
              <Text fontWeight="bold">{item.label}</Text>
              <Text color="fg.muted">{item.note}</Text>
              <Button
                size="sm"
                variant="ghost"
                colorPalette="danger"
                ms="-3"
                onClick={() => setItems(items.filter((i) => i.id !== item.id))}
              >
                Remove
              </Button>
            </Box>
          ),
        }))}
        onReorder={(ids) =>
          setItems(ids.map((id) => items.find((item) => item.id === id)!))}
      />
    </Box>
  );
}
