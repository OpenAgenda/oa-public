import React from 'react';
import cn from 'classnames';
import { css } from '@emotion/react';

export default function Pager({
  page,
  pageSize,
  total,
  previousPage,
  nextPage,
  previousMessage,
  nextMessage,
  className,
  propsRangeSize,
}) {
  const lastPage = Math.floor(
    total % pageSize !== 0 ? total / pageSize + 1 : total / pageSize
  );

  const previousDisabled = page === 1;
  const nextDisabled = page === lastPage;
  const calculedRangeSize = page === lastPage ? total - ((lastPage - 1) * pageSize) : pageSize;
  const rangeSize = propsRangeSize !== undefined ? propsRangeSize : calculedRangeSize;

  return (
    <nav>
      <ul className={cn('pager', className)}>
        <li
          className={cn('margin-right-xs', { disabled: previousDisabled })}
          title={previousMessage}
        >
          {previousDisabled ? (
            <span
              css={css`
                color: lightgray !important;
              `}
            >
              <i className="fa fa-lg fa-angle-left" />
            </span>
          ) : (
            <span
              tabIndex={0}
              role="button"
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
        <li title={nextMessage}>
          {nextDisabled ? (
            <span
              css={css`
                color: lightgray !important;
              `}
            >
              <i className="fa fa-lg fa-angle-right" />
            </span>
          ) : (
            <span
              tabIndex={0}
              role="button"
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
