import { useContext, useState } from 'react';
import { Modal } from '@openagenda/react-shared';

import DisplaySchemaData from '@openagenda/form-schemas/client/build/Components/DisplaySchemaData.js';
import I18nContext from '../contexts/I18nContext.js';

export default function DisplaySenderContext({ res, lang }) {
  const { getLabel } = useContext(I18nContext);
  const [displayContext, setDisplayContext] = useState(false);

  return (
    <>
      {displayContext ? (
        <Modal res={res} lang={lang} onClose={() => setDisplayContext(false)}>
          <DisplaySchemaData res={res} lang={lang} />
        </Modal>
      ) : null}
      <button
        type="button"
        className="btn btn-link"
        onClick={() => setDisplayContext(true)}
        aria-label={getLabel('displaySenderDetails')}
      >
        <i className="fa fa-cog text-muted" />
      </button>
    </>
  );
}
