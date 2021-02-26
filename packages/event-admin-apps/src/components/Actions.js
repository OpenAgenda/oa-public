import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import qs from 'qs';
import { a11yButtonActionHandler } from '@openagenda/react-shared';
import DocxExportModal from '@openagenda/agenda-docx/client/build/ExportModal';
import exportsMessages from '../messages/exports';
import DownloadLink from './DownloadLink';

const messages = defineMessages({
  createAnEvent: {
    id: 'EventAdminApp.Actions.createAnEvent',
    defaultMessage: 'Create an event',
  },
});

export default function Actions({ agenda, query }) {
  const intl = useIntl();
  const [displayDocxModal, setDisplayDocxModal] = useState(false);

  const toggleDocxModal = useMemo(
    () => a11yButtonActionHandler(e => {
      if (e) {
        e.preventDefault();
      }

      setDisplayDocxModal(previous => !previous);
    }),
    []
  );

  const queryString = qs.stringify(query, {
    addQueryPrefix: true,
    skipNulls: true,
  });

  return (
    <div className="actions margin-bottom-sm">
      <span className="dropdown">
        <button
          className="btn btn-link btn-link-inline dropdown-toggle"
          type="button"
          id="actions-export"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="true"
        >
          {intl.formatMessage(exportsMessages.export)}
          &nbsp;
          <span className="caret" />
        </button>
        <ul className="dropdown-menu" aria-labelledby="actions-export">
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.json${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toJSON)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.csv${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toCSV)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.xlsx${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toXLSX)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.ics${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toICS)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.md${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toMD)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.txt${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toTXT)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.rss${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toRSS)}
            </DownloadLink>
          </li>
          <li>
            <a
              href="#docx"
              role="button"
              onClick={toggleDocxModal}
              onKeyPress={toggleDocxModal}
            >
              {intl.formatMessage(exportsMessages.toDOCX)}
            </a>
          </li>
        </ul>
      </span>

      <a href={`/${agenda.slug}/contribute`} className="margin-left-sm">
        {intl.formatMessage(messages.createAnEvent)}
      </a>

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
    </div>
  );
}
