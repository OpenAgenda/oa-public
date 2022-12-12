import { useLayoutEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useConstant } from '@openagenda/react-shared';
import ReactDOM from 'react-dom';
import FiltersPart from './FiltersPart';

const messages = defineMessages({
  filters: {
    id: 'EventAdminApp.FiltersPortal.filters',
    defaultMessage: 'Filters',
  },
});

export default function FiltersPortal({ filtersContainerRef, ...rest }) {
  const intl = useIntl();

  const filtersContainer = useConstant(() => document.createElement('div'));

  useLayoutEffect(() => {
    const filtersContainerElem = filtersContainerRef.current;

    filtersContainerElem.appendChild(filtersContainer);

    return () => filtersContainerElem.removeChild(filtersContainer);
  }, [filtersContainer, filtersContainerRef]);

  return ReactDOM.createPortal(
    <div>
      <div className="margin-bottom-xs">
        <b>{intl.formatMessage(messages.filters)}</b>
      </div>

      <FiltersPart {...rest} />
    </div>,
    filtersContainer,
  );
}
