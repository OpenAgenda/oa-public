import { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useLatestModule from 'react-use/lib/useLatest.js';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Modal } from '@openagenda/react-shared';
import { useSelector } from 'react-redux';
import useChartTitle from '../hooks/useChartTitle.js';

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

function ListItem({ stat, index }) {
  const { ref } = useSortable({ id: stat.id, index });
  return (
    <li className="list-group-item draggable" ref={ref}>
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
        <DragDropProvider
          onDragEnd={(event) => {
            const from = event.operation.source.sortable.initialIndex;
            const to = event.operation.source.sortable.previousIndex;
            const tempStats = [...latestStats.current];
            const [itemToMove] = tempStats.splice(from, 1);
            tempStats.splice(to, 0, itemToMove);
            setStats(tempStats);
          }}
        >
          {stats.map((stat, index) => (
            <ListItem key={stat.id} stat={stat} index={index} />
          ))}
        </DragDropProvider>
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
