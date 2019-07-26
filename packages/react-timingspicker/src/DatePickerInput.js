import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { DateUtils } from 'react-day-picker';
import dateFns from 'date-fns';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import deriveDateFormat from './utils/deriveDateFormat';

function parseDate( str, format, locale ) {
  const parsed = dateFnsParse( str, format, { locale } );
  if ( DateUtils.isDate( parsed ) ) {
    return parsed;
  }
  return undefined;
}

function formatDate( date, format, locale ) {
  return dateFnsFormat( date, format, { locale } );
}


export default function DatePickerInput( { input, meta, label, classNamePrefix, intl, weekStartsOn, ...rest } ) {
  const derivedDateFormat = deriveDateFormat( intl ).toUpperCase();
  const dayPickerProps = {
    firstDayOfWeek: weekStartsOn,
    locale: intl.locale,
    months: [],
    weekdaysLong: [],
    weekdaysShort: []
  };

  const startDate = dateFns.startOfWeek( new Date() );
  const formatMonth = val => intl.formatDate( new Date( startDate.getFullYear(), val ), { month: 'long' } );
  dayPickerProps.months = Array( 12 ).fill().map( ( e, i ) => formatMonth( i ) );

  for ( let i = 0; i < 7; i++ ) {
    const day = dateFns.addDays( startDate, i );

    dayPickerProps.weekdaysLong.push( intl.formatDate( day, { weekday: 'long' } ) );
    dayPickerProps.weekdaysShort.push( intl.formatDate( day, { weekday: 'short' } ) );
  }

  const inputRef = React.createRef();

  const onDayPickerShow = () => {
    inputRef.current.overlayHasFocus = true;

    if ( inputRef.current.inputFocusTimeout ) {
      clearTimeout( inputRef.current.inputFocusTimeout );
    }
  };

  return (
    <section className={`${classNamePrefix}section`}>
      {label ? <div>{label}</div> : null}

      <DayPickerInput
        ref={inputRef}
        locale={intl.locale}
        {...input}
        {...rest}
        onDayPickerShow={onDayPickerShow}
        className={`${classNamePrefix}DatePicker`}
        formatDate={formatDate}
        format={derivedDateFormat}
        parseDate={parseDate}
        placeholder={`${dateFnsFormat(new Date(), derivedDateFormat)}`}
        dayPickerProps={dayPickerProps}
        keepFocus={false}
      />

      {meta.touched && meta.error ? (
        <div className={`${classNamePrefix}input-error`}>
          {intl.formatMessage( messages[ meta.error ] )}
        </div>
      ) : null}
    </section>
  );
}
