import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Modal } from '@openagenda/react-shared';
import session from '@openagenda/sessions/client';

export default function FlashModal() {
  const [flashMessage, setFlashMessage] = useState(null);
  const location = useLocation();

  const removeMessage = useCallback(
    () => setFlashMessage(null),
    [setFlashMessage]
  );

  // On location change
  useEffect(() => setFlashMessage(session.flash()), [location.pathname]);

  return flashMessage && flashMessage !== '' ? (
    <Modal>
      <div className="text-center">
        <p className="margin-top-sm">{flashMessage}</p>

        <button
          type="button"
          onClick={removeMessage}
          className="btn btn-primary"
        >
          Ok
        </button>
      </div>
    </Modal>
  ) : null;
}
