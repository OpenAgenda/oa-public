import { css } from '@emotion/react';
import { useIntl } from 'react-intl';
import mapMessages from '../../../messages/map.js';

export default function SearchHereControl({ searchHere }) {
  const intl = useIntl();

  return (
    <div
      css={css`
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 400;
      `}
    >
      <button
        type="button"
        onClick={searchHere}
        css={css`
          outline: none;
          overflow: hidden;
          transition-duration: 0.2s;
          cursor: pointer;
          background: white;
          height: 24px;
          border-radius: 16px;
          padding: 0px 12px;
          box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 8px 0px;
          border: 0px;

          &:hover {
            background-color: #f3f3f3;
          }

          &:active {
            background-color: #eaeaea;
          }
        `}
      >
        {intl.formatMessage(mapMessages.searchHere)}
      </button>
    </div>
  );
}
