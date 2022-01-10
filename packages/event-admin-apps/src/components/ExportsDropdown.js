import React, { useMemo } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import cn from 'classnames';
import { css } from '@emotion/react';
import { a11yButtonActionHandler } from '@openagenda/react-shared';
import exportsMessages from '../messages/exports';

function DownloadButton({
  href,
  target = '_blank',
  rel = 'noopener noreferrer',
  download = '',
  children,
  ...props
}) {
  const handleClick = useMemo(
    () => a11yButtonActionHandler(e => {
      if (e) {
        e.preventDefault();
      }

      const elem = document.createElement('a');

      Object.assign(elem, {
        href,
        target,
        rel,
        download,
      });

      elem.click();
    }),
    [download, href, rel, target]
  );

  return (
    <button
      type="button"
      className="btn btn-link"
      css={css`
        width: 100%;
        text-align: left;
      `}
      onClick={handleClick}
      onKeyPress={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

function DownloadItem({ href, ...props }) {
  return (
    <MenuItem href={href}>
      <DownloadButton href={href} {...props} />
    </MenuItem>
  );
}

export default function ExportsDropdown({
  agenda,
  id = `agenda-${agenda.slug}-exports`,
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
      id={id}
      className={cn('btn-link-dropdown', className)}
      disabled={disabled}
    >
      <Dropdown.Toggle
        className="btn btn-link btn-link-inline dropdown-toggle"
        bsRole="toggle"
      >
        {children}
      </Dropdown.Toggle>
      <Dropdown.Menu bsRole="menu">
        <DownloadItem
          download="events.v2.json"
          href={`/agendas/${agenda.uid}/admin/events.v2.json${queryString}`}
        >
          {intl.formatMessage(exportsMessages.toJSON)}
        </DownloadItem>
        <li>
          <button
            type="button"
            className="btn btn-link"
            css={css`
              width: 100%;
              text-align: left;
            `}
            onClick={toggleSpreadsheetModal}
            onKeyPress={toggleSpreadsheetModal}
          >
            {intl.formatMessage(exportsMessages.toSpreadsheet)}
          </button>
        </li>
        <DownloadItem
          download="events.v2.ics"
          href={`/agendas/${agenda.uid}/admin/events.v2.ics${queryString}`}
        >
          {intl.formatMessage(exportsMessages.toICS)}
        </DownloadItem>
        <DownloadItem
          download="events.v2.md"
          href={`/agendas/${agenda.uid}/admin/events.v2.md${queryString}`}
        >
          {intl.formatMessage(exportsMessages.toMD)}
        </DownloadItem>
        <DownloadItem
          download="events.v2.txt"
          href={`/agendas/${agenda.uid}/admin/events.v2.txt${queryString}`}
        >
          {intl.formatMessage(exportsMessages.toTXT)}
        </DownloadItem>
        <DownloadItem
          download="events.v2.rss"
          href={`/agendas/${agenda.uid}/admin/events.v2.rss${queryString}`}
        >
          {intl.formatMessage(exportsMessages.toRSS)}
        </DownloadItem>
        {toggleDocxModal ? (
          <li>
            <button
              type="button"
              className="btn btn-link"
              css={css`
                width: 100%;
                text-align: left;
              `}
              onClick={toggleDocxModal}
              onKeyPress={toggleDocxModal}
            >
              {intl.formatMessage(exportsMessages.toDOCX)}
            </button>
          </li>
        ) : null}
      </Dropdown.Menu>
    </Dropdown>
  );
}
