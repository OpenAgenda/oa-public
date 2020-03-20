import _ from 'lodash';
import React from 'react';
import classNames from 'classnames';

export default function CustomTooltip({
  renderItem,
  payload,
  itemSorter,
  wrapperClassName,
  contentStyle
}) {
  if (!payload?.length || typeof renderItem !== 'function') {
    return null;
  }

  const wrapperCN = classNames('recharts-default-tooltip', wrapperClassName);

  const items = (itemSorter ? _.sortBy(payload, itemSorter) : payload).map(
    (entry, index, array) => {
      if (entry.type === 'none') {
        return null;
      }

      return renderItem(entry, index, array);
    }
  );

  return (
    <div className={wrapperCN} css={contentStyle}>
      <ul className="recharts-tooltip-item-list">{items}</ul>
    </div>
  );
}
