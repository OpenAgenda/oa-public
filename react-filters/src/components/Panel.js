import { useMemo, useState } from 'react';
import cn from 'classnames';
import { a11yButtonActionHandler } from '@openagenda/react-shared';

export default function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children,
}) {
  // default state when used without setCollapsed
  const internalState = useState(collapsed);

  const value = typeof setCollapsed === 'function' ? collapsed : internalState[0];
  const updater = typeof setCollapsed === 'function' ? setCollapsed : internalState[1];

  const toggleCollapsed = useMemo(
    () =>
      a11yButtonActionHandler((e) => {
        e.preventDefault();

        updater((v) => !v);
      }),
    [updater],
  );

  return (
    <div
      className={cn('oa-collapse-item', { 'oa-collapse-item-active': !value })}
    >
      <div
        className="oa-collapse-header"
        role="tab"
        tabIndex="0"
        aria-expanded={!value}
        onClick={toggleCollapsed}
        onKeyPress={toggleCollapsed}
      >
        {header}
        <span className="oa-collapse-arrow">
          <i
            className={cn('fa fa-lg', {
              'fa-angle-up': !value,
              'fa-angle-down': value,
            })}
            aria-hidden="true"
          />
        </span>
      </div>
      <div
        className={cn('oa-collapse-content', {
          'oa-collapse-content-active': !value,
          'oa-collapse-content-inactive': value,
        })}
        role="tabpanel"
      >
        <div className="oa-collapse-content-box">{children}</div>
      </div>
    </div>
  );
}
