import { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import qs from 'qs';
import { a11yButtonActionHandler } from '@openagenda/react-shared';
import DocxExportModal from '@openagenda/agenda-docx/client/build/ExportModal.js';
import exportsMessages from '../messages/exports.js';
import SpreadsheetModal from './SpreadsheetModal.js';
import PdfModal from './PdfModal.js';
import ExportsDropdown from './ExportsDropdown.js';

const messages = defineMessages({
  createAnEvent: {
    id: 'EventAdminApp.Actions.createAnEvent',
    defaultMessage: 'Create an event',
  },
  select: {
    id: 'EventAdminApp.Actions.select',
    defaultMessage: 'Select',
  },
});

export default function Actions({
  agenda,
  query,
  // selectMode,
  // toggleSelectMode,
}) {
  const intl = useIntl();
  const [displayDocxModal, setDisplayDocxModal] = useState(false);
  const [displaySpreadsheetModal, setDisplaySpreadsheetModal] = useState(false);
  const [displayPdfModal, setDisplayPdfModal] = useState(false);

  const toggleDocxModal = useMemo(
    () =>
      a11yButtonActionHandler((e) => {
        if (e) {
          e.preventDefault();
        }

        setDisplayDocxModal((previous) => !previous);
      }),
    [],
  );

  const toggleSpreadsheetModal = useMemo(
    () =>
      a11yButtonActionHandler((e) => {
        if (e) {
          e.preventDefault();
        }

        setDisplaySpreadsheetModal((previous) => !previous);
      }),
    [],
  );

  const togglePdfModal = useMemo(
    () =>
      a11yButtonActionHandler((e) => {
        if (e) {
          e.preventDefault();
        }

        setDisplayPdfModal((previous) => !previous);
      }),
    [],
  );

  const queryString = qs.stringify(
    { size: -1, ...query },
    {
      addQueryPrefix: true,
      skipNulls: true,
    },
  );

  return (
    <div className="actions margin-bottom-md" style={{ lineHeight: '16px' }}>
      <ExportsDropdown
        agenda={agenda}
        queryString={queryString}
        toggleDocxModal={toggleDocxModal}
        toggleSpreadsheetModal={toggleSpreadsheetModal}
        togglePdfModal={togglePdfModal}
        className="margin-right-sm"
      >
        {intl.formatMessage(exportsMessages.export)}
      </ExportsDropdown>

      <Link to={`/${agenda.slug}/contribute`}>
        {intl.formatMessage(messages.createAnEvent)}
      </Link>

      {/* <button
        className="btn btn-link btn-link-inline"
        type="button"
        onClick={toggleSelectMode}
        disabled={selectMode}
      >
        {intl.formatMessage(messages.select)}
      </button> */}

      {/* <button type="button" className="btn btn-link btn-link-inline" onClick={toggleExports}> */}
      {/*   {intl.formatMessage(exportsMessages.export)} */}
      {/* </button> */}

      {/* {displayExports ? ( */}
      {/*  <div> */}
      {/*     {intl.formatMessage(exportsMessages.exportDesc, { total })} */}
      {/*   </div> */}
      {/* ) : null} */}

      {displayDocxModal ? (
        <DocxExportModal
          onClose={toggleDocxModal}
          locale={intl.locale}
          agendaUid={agenda.uid}
          res="/docx"
        />
      ) : null}

      {displaySpreadsheetModal ? (
        <SpreadsheetModal
          onClose={toggleSpreadsheetModal}
          agendaUid={agenda.uid}
          queryString={queryString}
        />
      ) : null}

      {displayPdfModal ? (
        <PdfModal
          onClose={togglePdfModal}
          agendaUid={agenda.uid}
          queryString={queryString}
        />
      ) : null}
    </div>
  );
}
