import { useUIDSeed } from 'react-uid';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  searchWithMap: {
    id: 'ReactFilters.MapField.searchWithMap',
    defaultMessage: 'Search with map',
  },
});

export default function SearchWithMap({
  name,
  userControlled,
  toggleUserControlled,
  searchMessage,
}) {
  const intl = useIntl();
  const seed = useUIDSeed();

  return (
    <div className="checkbox">
      <label htmlFor={seed('input')}>
        <input
          name={`${name}-userControlled`}
          type="checkbox"
          id={seed('input')}
          checked={userControlled}
          onChange={toggleUserControlled}
        />{' '}
        {searchMessage || intl.formatMessage(messages.searchWithMap)}
      </label>
    </div>
  );
}
