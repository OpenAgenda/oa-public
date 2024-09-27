import { useIntl } from 'react-intl';
import { Calendar } from 'react-date-range';
import * as rdrLocales from 'react-date-range/dist/locale';
import { format } from 'date-fns';
import { Dropdown } from '@openagenda/react-shared';
import messages from './messages';

const getContent = (value, intl) => {
  if (!value) return intl.formatMessage(messages.datePlaceholder);

  return format(value, 'yyyy-MM-dd');
};

const getValueAsDate = (v) => {
  if (!v) return v;

  return typeof v === 'string' ? new Date(v) : v;
};

export default function DateField({ value, onChange }) {
  const intl = useIntl();

  const cleanValue = getValueAsDate(value);

  return (
    <Dropdown
      className="dropdown btn-group open"
      Trigger={(props) => (
        <button
          type="button"
          {...props}
          className="form-control btn btn-default"
        >
          {getContent(cleanValue, intl)}&nbsp;
          <span className="caret" />
        </button>
      )}
    >
      <div className="dropdown-calendar" style={{ minWidth: '300px' }}>
        <Calendar
          date={cleanValue || null}
          onChange={onChange}
          locale={rdrLocales[intl.locale]}
        />
      </div>
    </Dropdown>
  );
}
