import { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useLatestModule from 'react-use/lib/useLatest.js';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Modal, dragAndDrop } from '@openagenda/react-shared';
import { useSelector } from 'react-redux';
import useChartTitle from '../hooks/useChartTitle.js';

const { arrayMove } = dragAndDrop;

const useLatest = useLatestModule.default || useLatestModule;

const messages = defineMessages({
  submit: {
    id: 'AgendaStats.OrderModal.submit',
    defaultMessage: 'Modify',
  },
  modalTitle: {
    id: 'AgendaStats.OrderModal.modalTitle',
    defaultMessage: 'Change order',
  },
  separator: {
    id: 'AgendaStats.OrderModal.separator',
    defaultMessage: 'Separator',
  },
  width: {
    id: 'AgendaStats.OrderModal.width',
    defaultMessage: 'Width:',
  },
  oneColumn: {
    id: 'AgendaStats.OrderModal.oneColumn',
    defaultMessage: 'One column',
  },
  oneLine: {
    id: 'AgendaStats.OrderModal.oneLine',
    defaultMessage: 'One line',
  },
});

function Chart({ stat }) {
  const intl = useIntl();

  const title = useChartTitle(stat);
  const width = stat.chart.width || 1;

  return (
    <>
      <b>{title}</b>
      <div>
        {intl.formatMessage(messages.width)}{' '}
        <em>
          {width === 1 ? intl.formatMessage(messages.oneColumn) : null}
          {width === 2 ? intl.formatMessage(messages.oneLine) : null}
        </em>
      </div>
    </>
  );
}

function Separator() {
  const intl = useIntl();

  return <em>{intl.formatMessage(messages.separator)}</em>;
}

function ListItem({ stat }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stat.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <li
      className="list-group-item draggable"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="list-group-item-content draggable">
        {stat.chart ? <Chart stat={stat} /> : null}
        {stat.separator ? <Separator /> : null}
      </div>
    </li>
  );
}

export default function OrderModal({ onSubmit, onClose }) {
  const intl = useIntl();

  const initialStats = useSelector((state) => state.stats.data);

  const [stats, setStats] = useState(() =>
    initialStats.filter((v) => v.chart || v.separator));
  const latestStats = useLatest(stats);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSubmit = useCallback(() => {
    onSubmit(latestStats.current.map((stat) => stat.id));
    onClose();
  }, [latestStats, onSubmit, onClose]);

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle)}
      onClose={onClose}
      classNames={{
        overlay: 'popup-overlay big',
      }}
      disableBodyScroll
    >
      <div className="margin-top-sm">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (active.id !== over?.id) {
              const ids = latestStats.current.map((s) => s.id);
              const oldIndex = ids.indexOf(active.id);
              const newIndex = ids.indexOf(over.id);
              setStats(arrayMove(latestStats.current, oldIndex, newIndex));
            }
          }}
        >
          <SortableContext
            items={stats.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {stats.map((stat) => (
              <ListItem key={stat.id} stat={stat} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="text-center margin-top-md">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {intl.formatMessage(messages.submit)}
        </button>
      </div>
    </Modal>
  );
}
