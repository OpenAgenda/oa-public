import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router';
import Cookies from 'js-cookie';
import { Modal } from '@openagenda/react-shared';

function readFlash() {
  const value = Cookies.get('oa.flash');
  if (!value) return null;
  Cookies.remove('oa.flash', { path: '/' });
  return value;
}

export default function FlashModal() {
  const [flashMessage, setFlashMessage] = useState(null);
  const location = useLocation();

  const removeMessage = useCallback(
    () => setFlashMessage(null),
    [setFlashMessage],
  );

  // On location change
  useEffect(() => setFlashMessage(readFlash()), [location.pathname]);

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
