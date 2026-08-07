import { useIntl } from 'react-intl';
import mapMessages from '../../../messages/map.js';

export default function SearchHereControl({ searchHere }) {
  const intl = useIntl();

  return (
    <div className="oa-filters-search-here">
      <button
        type="button"
        onClick={searchHere}
        className="oa-filters-search-here-button"
      >
        {intl.formatMessage(mapMessages.searchHere)}
      </button>
    </div>
  );
}
