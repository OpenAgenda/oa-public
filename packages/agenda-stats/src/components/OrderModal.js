import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLatest } from 'react-use';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Modal } from '@openagenda/react-components';
import useChartTitle from '../hooks/useChartTitle';

const messages = defineMessages({
  submit: {
    id: 'AgendaStats.OrderModal.submit',
    defaultMessage: 'Modify'
  },
  modalTitle: {
    id: 'AgendaStats.OrderModal.modalTitle',
    defaultMessage: 'Change order'
  },
  separator: {
    id: 'AgendaStats.OrderModal.separator',
    defaultMessage: 'Separator'
  }
});

function Chart({ stat }) {
  const title = useChartTitle(stat);

  return <b>{title}</b>;
}

function Separator() {
  const intl = useIntl();

  return <em>{intl.formatMessage(messages.separator)}</em>;
}

/* eslint-disable react/jsx-props-no-spreading */
export default function OrderModal({ initialStats, onSubmit, onClose }) {
  const intl = useIntl();

  const [stats, setStats] = useState(() => _.clone(initialStats));
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
        overlay: 'popup-overlay big'
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
