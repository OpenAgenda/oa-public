import React, { useState, useCallback } from 'react';
import { Modal } from '@openagenda/react-shared';

function SystemModal({ agenda, onClose }) {
  const [running, setRunning] = useState([]);

  const launch = useCallback((task) => {
    const {
      uid: agendaUID,
    } = agenda;

    fetch(`/api/agendas/${agendaUID}/settings/resync`, {
      method: 'POST',
      body: JSON.stringify([].concat(task)),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setRunning(running.concat(task));
  }, [running, agenda]);

  return (
    <Modal onClose={onClose}>
      <div className="margin-bottom-sm">
        <button
          type="button"
          disabled={running.includes('rebuildSearch')}
          className="btn btn-default margin-right-xs"
          onClick={() => launch('rebuildSearch')}
        >Index
        </button>
        <button
          type="button"
          disabled={running.includes('rebuildActivities')}
          className="btn btn-default margin-right-xs"
          onClick={() => launch('rebuildActivities')}
        >Feeds
        </button>
        <button
          type="button"
          disabled={running.includes('rebuildActivities')}
          className="btn btn-default margin-right-xs"
          onClick={() => launch('resyncInbox')}
        >Inbox
        </button>
      </div>
      <div>
        <button
          type="button"
          disabled={running.includes('rebuildActivities')}
          className="btn btn-warning margin-xs-right"
          onClick={() => launch(['resyncInbox', 'rebuildSearch', 'rebuildActivities'])}
        >Everything
        </button>
      </div>
    </Modal>
  );
}

export default function AgendaSystemMenu({ agenda }) {
  const [displayModal, setDisplayModal] = useState(false);
  return (
    <>
      {displayModal ? <SystemModal agenda={agenda} onClose={() => setDisplayModal(false)} /> : null}
      <button
        type="button"
        className="btn btn-link"
        style={{ color: 'transparent' }}
        onClick={() => setDisplayModal(true)}
        tabIndex="-1"
      >resyncs
      </button>
    </>
  );
}
