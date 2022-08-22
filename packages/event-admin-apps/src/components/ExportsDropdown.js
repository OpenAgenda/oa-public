import React from 'react';
import { useIntl } from 'react-intl';
import cn from 'classnames';
import { Dropdown } from '@openagenda/react-shared';
import exportsMessages from '../messages/exports';

export default function ExportsDropdown({
  agenda,
  queryString,
  toggleDocxModal,
  toggleSpreadsheetModal,
  className,
  disabled,
  children,
}) {
  const intl = useIntl();

  return (
    <Dropdown
      Trigger={({ onClick }) => (
        <button
          type="button"
          className="btn btn-link padding-v-xs btn-block btn-link-inline dropdown-toggle"
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </button>
      )}
      className={cn('btn-link-dropdown', className, 'dropdown open')}
    >
      <ul className="list-unstyled margin-bottom-z">
        <li key="exports-json">
          <a
            href={`/agendas/${agenda.uid}/admin/events.v2.json${queryString}`}
            download="events.v2.json"
            className="btn btn-link padding-v-xs btn-block"
          >
            {intl.formatMessage(exportsMessages.toJSON)}
          </a>
        </li>
        <li key="exports-spreadsheet">
          <button
            type="button"
            className="btn btn-link padding-v-xs btn-block"
            onClick={toggleSpreadsheetModal}
            onKeyPress={toggleSpreadsheetModal}
          >
            {intl.formatMessage(exportsMessages.toSpreadsheet)}
          </button>
        </li>
        <li key="exports-ics">
          <a
            download="events.v2.ics"
            href={`/agendas/${agenda.uid}/admin/events.v2.ics${queryString}`}
            className="btn btn-link padding-v-xs btn-block"
          >
            {intl.formatMessage(exportsMessages.toICS)}
          </a>
        </li>
        <li key="exports-markdown">
          <a
            download="events.v2.md"
            href={`/agendas/${agenda.uid}/admin/events.v2.md${queryString}`}
            className="btn btn-link padding-v-xs btn-block"
          >
            {intl.formatMessage(exportsMessages.toMD)}
          </a>
        </li>
        <li key="exports-txt">
          <a
            download="events.v2.txt"
            href={`/agendas/${agenda.uid}/admin/events.v2.txt${queryString}`}
            className="btn btn-link padding-v-xs btn-block"
          >
            {intl.formatMessage(exportsMessages.toTXT)}
          </a>
        </li>
        <li key="exports-rss">
          <a
            download="events.v2.rss"
            href={`/agendas/${agenda.uid}/admin/events.v2.rss${queryString}`}
            className="btn btn-link padding-v-xs btn-block"
          >
            {intl.formatMessage(exportsMessages.toRSS)}
          </a>
        </li>
        {toggleDocxModal ? (
          <li>
            <button
              type="button"
              className="btn btn-link padding-v-xs btn-block"
              onClick={toggleDocxModal}
              onKeyPress={toggleDocxModal}
            >
              {intl.formatMessage(exportsMessages.toDOCX)}
            </button>
          </li>
        ) : null}
      </ul>
    </Dropdown>
  );
}
