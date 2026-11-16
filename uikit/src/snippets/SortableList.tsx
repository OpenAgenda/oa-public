'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { chakra, IconButton, Text } from '@chakra-ui/react';
import * as React from 'react';
import { LuGripVertical } from 'react-icons/lu';

export interface SortableListItem {
  id: string;
  label: string;
}

export interface SortableListLabels {
  // The drag handle's name, for one item
  handle: (label: string) => string;
  // What the handle is (aria-roledescription), « sortable » otherwise
  roleDescription: string;
  // Read once, when a handle gets the focus: how to move with the keyboard
  instructions: string;
  // What a screen reader hears while an item moves (positions from 1)
  picked: (label: string, position: number, total: number) => string;
  moved: (label: string, position: number, total: number) => string;
  dropped: (label: string, position: number, total: number) => string;
  cancelled: (label: string) => string;
}

// uikit has no translations: an app passes its own, these are the fallback
const DEFAULT_LABELS: SortableListLabels = {
  handle: (label) => `Move ${label}`,
  roleDescription: 'sortable item',
  instructions:
    'To pick up an item, press Space or Enter. Use the arrow keys to move it, Space or Enter to drop it, Escape to cancel.',
  picked: (label, position, total) =>
    `Picked up ${label}, position ${position} of ${total}.`,
  moved: (label, position, total) =>
    `${label} moved to position ${position} of ${total}.`,
  dropped: (label, position, total) =>
    `${label} dropped at position ${position} of ${total}.`,
  cancelled: (label) => `Moving ${label} was cancelled.`,
};

function SortableRow({
  item,
  index,
  labels,
  actions,
}: {
  item: SortableListItem;
  index: number;
  labels: SortableListLabels;
  actions?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    attributes: { roleDescription: labels.roleDescription },
  });

  return (
    <chakra.li
      ref={setNodeRef}
      display="flex"
      alignItems="center"
      gap="2"
      ps="1"
      pe="3"
      py="1"
      bg="bg.panel"
      borderTopWidth={index ? 'thin' : '0'}
      borderColor="border"
      position="relative"
      zIndex={isDragging ? '1' : undefined}
      shadow={isDragging ? 'md' : undefined}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      // The row's own actions show on hover and focus, not to crowd the list;
      // always where there is no hover (touch screens)
      css={{
        '& [data-sortable-actions]': { opacity: 0 },
        '&:hover [data-sortable-actions], &:focus-within [data-sortable-actions]':
          { opacity: 1 },
        '@media (hover: none)': {
          '& [data-sortable-actions]': { opacity: 1 },
        },
      }}
    >
      <IconButton
        ref={setActivatorNodeRef}
        size="xs"
        variant="ghost"
        cursor={isDragging ? 'grabbing' : 'grab'}
        aria-label={labels.handle(item.label)}
        // To give the focus back to a row after a change of the list
        data-sortable-handle={item.id}
        {...attributes}
        {...listeners}
      >
        <LuGripVertical aria-hidden />
      </IconButton>
      <Text flex="1" textStyle="sm">
        {item.label}
      </Text>
      {actions ? (
        <chakra.div data-sortable-actions="" display="flex" gap="1">
          {actions}
        </chakra.div>
      ) : null}
    </chakra.li>
  );
}

export interface SortableListProps {
  items: SortableListItem[];
  // The ids in their new order, after a drop
  onReorder: (ids: string[]) => void;
  // A row's other buttons (remove, move up and down…), shown on hover and
  // focus
  renderActions?: (item: SortableListItem, index: number) => React.ReactNode;
  labels?: Partial<SortableListLabels>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// A list reordered by dragging its rows' handles, with the mouse, touch or
// the keyboard (Space or Enter, the arrows, Space or Enter again, Escape),
// each move told to screen readers
export function SortableList(props: SortableListProps) {
  const {
    items,
    onReorder,
    renderActions,
    labels: labelsProp,
    ...rest
  } = props;
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  // The same on the server and in the browser: dnd-kit counts its ids
  // otherwise, and the server-rendered list fails to hydrate
  const contextId = React.useId();
  const sensors = useSensors(
    // A click on the handle is not a drag: a few pixels first
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = items.map((item) => item.id);
  const labelOf = (id: UniqueIdentifier) =>
    items.find((item) => item.id === id)?.label ?? String(id);
  const positionOf = (id: UniqueIdentifier | undefined) =>
    (id === undefined ? 0 : ids.indexOf(String(id)) + 1);

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      labels.picked(labelOf(active.id), positionOf(active.id), items.length),
    onDragOver: ({ active, over }) => {
      if (!over) return undefined;
      return labels.moved(
        labelOf(active.id),
        positionOf(over.id),
        items.length,
      );
    },
    onDragEnd: ({ active, over }) =>
      labels.dropped(
        labelOf(active.id),
        positionOf(over?.id ?? active.id),
        items.length,
      ),
    onDragCancel: ({ active }) => labels.cancelled(labelOf(active.id)),
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(
      arrayMove(
        ids,
        ids.indexOf(String(active.id)),
        ids.indexOf(String(over.id)),
      ),
    );
  };

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: labels.instructions },
      }}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <chakra.ol
          listStyleType="none"
          ms="0"
          borderWidth="thin"
          borderColor="border"
          rounded="l2"
          {...rest}
        >
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              index={index}
              labels={labels}
              actions={renderActions?.(item, index)}
            />
          ))}
        </chakra.ol>
      </SortableContext>
    </DndContext>
  );
}
