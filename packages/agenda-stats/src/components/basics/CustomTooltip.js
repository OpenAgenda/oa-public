import _ from 'lodash';
import React from 'react';
import { ClassNames } from '@emotion/core';
import DefaultTooltipItem from './DefaultTooltipItem';

export default function CustomTooltip({
  renderItem,
  payload,
  itemSorter,
  wrapperClassName,
  contentStyle,
  dataKey,
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
        dataKey,
        key: `${index}-${entry.payload.key}`,
      };

      const itemRenderer = renderItem || DefaultTooltipItem;

      return React.isValidElement(itemRenderer)
        ? React.cloneElement(itemRenderer, itemProps)
        : React.createElement(itemRenderer, itemProps);
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
