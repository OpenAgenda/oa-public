import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import qs from 'qs';
import { css } from '@emotion/react';
import { a11yButtonActionHandler } from '@openagenda/react-shared';
import DocxExportModal from '@openagenda/agenda-docx/client/build/ExportModal';
import exportsMessages from '../messages/exports';
import SpreadsheetModal from './SpreadsheetModal';
import ExportsDropdown from './ExportsDropdown';

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

  const toggleDocxModal = useMemo(
    () => a11yButtonActionHandler(e => {
      if (e) {
        e.preventDefault();
      }

      setDisplayDocxModal(previous => !previous);
    }),
    []
  );

  const toggleSpreadsheetModal = useMemo(
    () => a11yButtonActionHandler(e => {
      if (e) {
        e.preventDefault();
      }

      setDisplaySpreadsheetModal(previous => !previous);
    }),
    []
  );

  const queryString = qs.stringify(
    { size: -1, ...query },
    {
      addQueryPrefix: true,
      skipNulls: true,
    }
  );

  return (
    <div
      className="actions margin-bottom-md"
      css={css`
        line-height: 16px;
      `}
    >
      <ExportsDropdown
        agenda={agenda}
        queryString={queryString}
        toggleDocxModal={toggleDocxModal}
        toggleSpreadsheetModal={toggleSpreadsheetModal}
        className="margin-right-sm"
      >
        {intl.formatMessage(exportsMessages.export)}
      </ExportsDropdown>

      <a href={`/${agenda.slug}/contribute`}>
        {intl.formatMessage(messages.createAnEvent)}
      </a>

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
    </div>
  );
}
