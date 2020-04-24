import _ from 'lodash';
import React from 'react';
import { ClassNames } from '@emotion/core';

function DefaultTooltipItem({ entry, labelKey }) {
  return (
    <li key={`tooltip-item-${entry.key}`} className="recharts-tooltip-item">
      <span>
        <b>{_.get(entry.payload, labelKey)}</b>
        <br />
        {entry.value} événements
      </span>
    </li>
  );
}

export default function CustomTooltip({
  renderItem,
  payload,
  itemSorter,
  wrapperClassName,
  contentStyle,
  labelKey
}) {
  if (!payload?.length) {
    return null;
  }

  const items = (itemSorter ? _.sortBy(payload, itemSorter) : payload).map(
    (entry, index, array) => {
      if (entry.type === 'none') {
        return null;
      }

      const itemProps = {
        entry,
        index,
        array,
        labelKey
      };

      return React.isValidElement(renderItem)
        ? React.cloneElement(renderItem, itemProps)
        : React.createElement(DefaultTooltipItem, itemProps);
    }
  );

  return (
    <ClassNames>
      {({ css, cx }) => (
        <div
          className={cx(
            css`
              margin: 0;
              padding: 6px;
              background-color: #fff;
              border: 1px solid #ccc;
              white-space: nowrap;
            `,
            'recharts-default-tooltip',
            wrapperClassName
          )}
        >
          <ul
            className={cx(
              css`
                padding: 0;
                margin: 0;
                list-style-type: none;
              `,
              'recharts-tooltip-item-list',
              contentStyle
            )}
          >
            {items}
          </ul>
        </div>
      )}
    </ClassNames>
  );
}
