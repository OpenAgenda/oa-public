import { useIntl } from 'react-intl';
import Style from '../../Style.js';
import mapMessages from '../../../messages/map.js';

const css = `
.oa-filters-search-here {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 400;
}

.oa-filters-search-here-button {
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
}

.oa-filters-search-here-button:hover {
  background-color: #f3f3f3;
}

.oa-filters-search-here-button:active {
  background-color: #eaeaea;
}
`;

export default function SearchHereControl({ searchHere }) {
  const intl = useIntl();

  return (
    <div className="oa-filters-search-here">
      <Style name="SearchHereControl">{css}</Style>
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
