import { useUIDSeed } from 'react-uid';
import { useIntl } from 'react-intl';
import mapMessages from '../../../messages/map.js';

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
        {searchMessage || intl.formatMessage(mapMessages.searchWithMap)}
      </label>
    </div>
  );
}
