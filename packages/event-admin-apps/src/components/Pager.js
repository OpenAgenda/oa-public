import { defineMessages, useIntl } from 'react-intl';
import cn from 'classnames';

const messages = defineMessages({
  previous: {
    id: 'EventAdminApp.Dashboard.previous',
    defaultMessage: 'Previous',
  },
  next: {
    id: 'EventAdminApp.Dashboard.next',
    defaultMessage: 'Next',
  },
});

export default function Pager({
  page,
  pageSize,
  total,
  rangeSize,
  previousPage,
  nextPage,
  className,
}) {
  const intl = useIntl();

  const lastPage = Math.floor(
    total % pageSize !== 0 ? total / pageSize + 1 : total / pageSize,
  );

  const previousDisabled = page === 1;
  const nextDisabled = page === lastPage;

  return (
    <nav>
      <ul className={cn('pager', className)}>
        <li
          className={cn('margin-right-xs', { disabled: previousDisabled })}
          title={intl.formatMessage(messages.previous)}
        >
          {previousDisabled ? (
            <span style={{ color: 'lightgray' }}>
              <i className="fa fa-lg fa-angle-left" />
            </span>
          ) : (
            <span
              tabIndex={0}
              role="button"
              aria-label={intl.formatMessage(messages.previous)}
              onClick={previousPage}
              onKeyPress={previousPage}
            >
              <i className="fa fa-lg fa-angle-left" />
            </span>
          )}
        </li>
        <li className="margin-right-xs">
          {(page - 1) * pageSize + 1} – {(page - 1) * pageSize + rangeSize}
        </li>
        <li title={intl.formatMessage(messages.next)}>
          {nextDisabled ? (
            <span style={{ color: 'lightgray' }}>
              <i className="fa fa-lg fa-angle-right" />
            </span>
          ) : (
            <span
              tabIndex={0}
              role="button"
              aria-label={intl.formatMessage(messages.next)}
              onClick={nextPage}
              onKeyPress={nextPage}
            >
              <i className="fa fa-lg fa-angle-right" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
