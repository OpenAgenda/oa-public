import React, { useMemo, useState } from 'react';
import cn from 'classnames';
import { a11yButtonActionHandler } from '@openagenda/react-shared';

export default function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  // default state when used without setCollapsed
  const internalState = useState(collapsed);

  const value = typeof setCollapsed === 'function' ? collapsed : internalState[0];
  const updater = typeof setCollapsed === 'function' ? setCollapsed : internalState[1];

  const toggleCollapsed = useMemo(
    () => a11yButtonActionHandler(e => {
      e.preventDefault();

      updater(v => !v);
    }),
    [updater]
  );

  return (
    <div
      className={cn('rc-collapse-item', { 'rc-collapse-item-active': !value })}
    >
      <div
        className="rc-collapse-header"
        role="tab"
        tabIndex="0"
        aria-expanded={!value}
        onClick={toggleCollapsed}
        onKeyPress={toggleCollapsed}
      >
        <i className="arrow" />
        {header}
      </div>
      <div
        className={cn('rc-collapse-content', {
          'rc-collapse-content-active': !value,
          'rc-collapse-content-inactive': value
        })}
        role="tabpanel"
      >
        <div className="rc-collapse-content-box">{children}</div>
      </div>
    </div>
  );
}
