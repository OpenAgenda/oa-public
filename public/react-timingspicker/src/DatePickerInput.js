import DayPickerInput from 'react-day-picker/DayPickerInput.js';
import { DateUtils } from 'react-day-picker';
import * as dateFns from 'date-fns';
import deriveDateFormat from './utils/deriveDateFormat.js';

function formatDate(date, format) {
  return dateFns.format(date, format);
}

function parseDate(str, format) {
  const parsed = dateFns.parse(str, format, new Date());

  if (
    DateUtils.isDate(parsed)
    && str.length === formatDate(parsed, format).length
  ) {
    return parsed;
  }

  return undefined;
}

export default function DatePickerInput({
  input,
  meta,
  label,
  classNamePrefix,
  intl,
  weekStartsOn,
  ...rest
}) {
  const derivedDateFormat = deriveDateFormat(intl);

  const dayPickerProps = {
    firstDayOfWeek: weekStartsOn,
    locale: intl.locale,
    months: [],
    weekdaysLong: [],
    weekdaysShort: [],
  };

  const startDate = dateFns.startOfWeek(new Date());
  const formatMonth = (val) =>
    intl.formatDate(new Date(startDate.getFullYear(), val), { month: 'long' });
  dayPickerProps.months = Array(12)
    .fill()
    .map((e, i) => formatMonth(i));

  for (let i = 0; i < 7; i++) {
    const day = dateFns.addDays(startDate, i);

    dayPickerProps.weekdaysLong.push(intl.formatDate(day, { weekday: 'long' }));
    dayPickerProps.weekdaysShort.push(
      intl.formatDate(day, { weekday: 'short' }),
    );
  }

  return (
    <section className={`${classNamePrefix}section`}>
      {label ? <div>{label}</div> : null}

      <DayPickerInput
        locale={intl.locale}
        {...input}
        {...rest}
        onDayChange={input.onChange}
        className={`${classNamePrefix}DatePicker`}
        formatDate={formatDate}
        format={derivedDateFormat}
        parseDate={parseDate}
        placeholder={`${dateFns.format(new Date(), derivedDateFormat)}`}
        dayPickerProps={dayPickerProps}
      />

      {meta.touched && meta.error ? (
        <div className={`${classNamePrefix}input-error`}>{meta.error}</div>
      ) : null}
    </section>
  );
}
