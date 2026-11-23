import { useState } from 'react';
import { Box, IconButton } from '../src';
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
