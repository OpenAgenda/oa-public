import _ from 'lodash';
import React from 'react';
import cn from 'classnames';
import DefaultTooltipItem from './DefaultTooltipItem.js';

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
    },
  );

  return (
    <div
      style={{
        margin: '0',
        padding: '6px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        whiteSpace: 'nowrap',
      }}
      className={cn('recharts-default-tooltip', wrapperClassName)}
    >
      <ul
        style={{
          padding: 0,
          margin: 0,
          listStyleType: 'none',
        }}
        className={cn('recharts-tooltip-item-list', contentStyle)}
      >
        {items}
      </ul>
    </div>
  );
}
