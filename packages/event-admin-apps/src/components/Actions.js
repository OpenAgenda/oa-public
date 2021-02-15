import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import qs from 'qs';

const messages = defineMessages({
  export: {
    id: 'EventAdminApp.Actions.export',
    defaultMessage: 'Export',
  },
  exportDesc: {
    id: 'EventAdminApp.Actions.exportDesc',
    defaultMessage:
      'Export {total, plural, =0 {# event} one {# event} other {# events}}',
  },
  toJSON: {
    id: 'EventAdminApp.Actions.toJSON',
    defaultMessage: 'to JSON',
  },
  toCSV: {
    id: 'EventAdminApp.Actions.toCSV',
    defaultMessage: 'to CSV',
  },
  toXLSX: {
    id: 'EventAdminApp.Actions.toXLSX',
    defaultMessage: 'to XLSX',
  },
  toICS: {
    id: 'EventAdminApp.Actions.toICS',
    defaultMessage: 'to ICS',
  },
  toMD: {
    id: 'EventAdminApp.Actions.toMD',
    defaultMessage: 'to MD',
  },
  toTXT: {
    id: 'EventAdminApp.Actions.toTXT',
    defaultMessage: 'to TXT',
  },
  toRSS: {
    id: 'EventAdminApp.Actions.toRSS',
    defaultMessage: 'to RSS',
  },
  toDOCX: {
    id: 'EventAdminApp.Actions.toDOCX',
    defaultMessage: 'to DOCX',
  },
});

function DownloadLink({ children, ...props }) {
  return (
    <a target="_blank" rel="noopener noreferrer" download {...props}>
      {children}
    </a>
  );
}

export default function Actions({ agenda, query }) {
  const intl = useIntl();
  // const [displayExports, setDisplayExports] = useState(false);
  //
  // const toggleExports = useCallback(
  //   () => setDisplayExports(previous => !previous),
  //   []
  // );

  const queryString = qs.stringify(query, {
    addQueryPrefix: true,
    skipNulls: true,
  });

  return (
    <div className="actions margin-bottom-sm">
      <div className="dropdown">
        <button
          className="btn btn-default dropdown-toggle"
          type="button"
          id="dropdownMenu1"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="true"
        >
          {intl.formatMessage(messages.export)}
          &nbsp;
          <span className="caret" />
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.json${queryString}`}
            >
              {intl.formatMessage(messages.toJSON)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.csv${queryString}`}
            >
              {intl.formatMessage(messages.toCSV)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.xlsx${queryString}`}
            >
              {intl.formatMessage(messages.toXLSX)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.ics${queryString}`}
            >
              {intl.formatMessage(messages.toICS)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.md${queryString}`}
            >
              {intl.formatMessage(messages.toMD)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.txt${queryString}`}
            >
              {intl.formatMessage(messages.toTXT)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.rss${queryString}`}
            >
              {intl.formatMessage(messages.toRSS)}
            </DownloadLink>
          </li>
          {/* <li> */}
          {/*   <DownloadLink href={`/agendas/${agenda.uid}/admin/events.v2.docx${queryString}`}> */}
          {/*     {intl.formatMessage(messages.toDOCX)} */}
          {/*   </DownloadLink> */}
          {/* </li> */}
        </ul>
      </div>

      {/* <button type="button" className="btn btn-link btn-link-inline" onClick={toggleExports}> */}
      {/*   {intl.formatMessage(messages.export)} */}
      {/* </button> */}

      {/* {displayExports ? ( */}
      {/*  <div> */}
      {/*     {intl.formatMessage(messages.exportDesc, { total })} */}
      {/*   </div> */}
      {/* ) : null} */}
    </div>
  );
}
