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
  showAllFilters: {
    id: 'EventAdminApp.FiltersPortal.showAllFilters',
    defaultMessage: 'Show all filters',
  },
});

export default function FiltersPortal({
  filtersContainerRef,
  agenda,
  onShowAllFilters,
  isShowingAllFilters,
  ...rest
}) {
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

      <FiltersPart {...rest} agenda={agenda} />
      {!isShowingAllFilters ? (
        <button
          type="button"
          className="btn btn-link padding-left-z"
          onClick={() => onShowAllFilters()}
        >
          {intl.formatMessage(messages.showAllFilters)}
        </button>
      ) : null}
    </div>,
    filtersContainer,
  );
}
