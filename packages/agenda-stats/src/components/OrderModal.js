import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLatest } from 'react-use';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Modal } from '@openagenda/react-shared';
import { useSelector } from 'react-redux';
import useChartTitle from '../hooks/useChartTitle';

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

export default function OrderModal({ onSubmit, onClose }) {
  const intl = useIntl();

  const initialStats = useSelector(state => state.stats.data);

  const [stats, setStats] = useState(() => initialStats.filter(v => v.chart || v.separator));
  const latestStats = useLatest(stats);

  const onDragEnd = useCallback(
    result => {
      if (!result.destination) {
        return;
      }

      const tempStats = [...latestStats.current];
      const [itemToMove] = tempStats.splice(result.source.index, 1);
      tempStats.splice(result.destination.index, 0, itemToMove);

      setStats(tempStats);
    },
    [latestStats]
  );

  const handleSubmit = useCallback(() => {
    onSubmit(latestStats.current.map(stat => stat.id));
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
        <DragDropContext className="list-group" onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {stats.map((stat, index) => (
                  <Draggable key={stat.id} draggableId={stat.id} index={index}>
                    {(provideInner, { isDragging }) => (
                      <li
                        className={`list-group-item draggable${
                          isDragging ? ' dragged' : ''
                        }`}
                        ref={provideInner.innerRef}
                        {...provideInner.draggableProps}
                        {...provideInner.dragHandleProps}
                      >
                        {stat.chart ? <Chart stat={stat} /> : null}
                        {stat.separator ? <Separator /> : null}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
