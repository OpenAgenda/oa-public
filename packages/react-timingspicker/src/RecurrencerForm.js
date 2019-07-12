import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import setFieldData from 'final-form-set-field-data';
import Select from 'react-select';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import dateFns from 'date-fns';
import WeekdayPicker from './WeekdayPicker';
import deriveDateFormat from './utils/deriveDateFormat';
import getWeekOfMonth from './utils/getWeekOfMonth';
import getDateFromFormat from './utils/getDateFromFormat';

const numberMask = createNumberMask( {
  prefix: '',
  integerLimit: 3
} );

const messages = defineMessages( {
  title: {
    id: 'rtp.recurrencerForm.title',
    defaultMessage: 'Define a recurring timing'
  },
  day: {
    id: 'rtp.recurrencerForm.day',
    defaultMessage: 'day'
  },
  week: {
    id: 'rtp.recurrencerForm.week',
    defaultMessage: 'week'
  },
  month: {
    id: 'rtp.recurrencerForm.month',
    defaultMessage: 'month'
  },
  year: {
    id: 'rtp.recurrencerForm.year',
    defaultMessage: 'year'
  },
  submit: {
    id: 'rtp.recurrencerForm.submit',
    defaultMessage: 'Apply'
  },
  repeatEvery: {
    id: 'rtp.recurrencerForm.repeatEvery',
    defaultMessage: 'Repeat every'
  },
  repeatThe: {
    id: 'rtp.recurrencerForm.repeatThe',
    defaultMessage: 'Repeat the'
  },
  the: {
    id: 'rtp.recurrencerForm.the',
    defaultMessage: 'The'
  },
  after: {
    id: 'rtp.recurrencerForm.after',
    defaultMessage: 'After'
  },
  occurrences: {
    id: 'rtp.recurrencerForm.occurrences',
    defaultMessage: 'occurrences'
  },
  ends: {
    id: 'rtp.recurrencerForm.ends',
    defaultMessage: 'Ends'
  },
  everyMonthByDate: {
    id: 'rtp.recurrencerForm.everyMonthByDate',
    defaultMessage: 'Every {dayNumber, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} of the month'
  },
  everyMonthByWeekday: {
    id: 'rtp.recurrencerForm.everyMonthByWeekday',
    defaultMessage: 'Every {weekNumber, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} {weekday} of the month'
  },
  invalidFrequence: {
    id: 'rtp.recurrencerForm.invalidFrequence',
    defaultMessage: 'Invalid frequence'
  },
  intervalTooSmall: {
    id: 'rtp.recurrencerForm.intervalTooSmall',
    defaultMessage: 'Interval must be greater than 0'
  },
  invalidDate: {
    id: 'rtp.recurrencerForm.invalidDate',
    defaultMessage: 'Invalid end date'
  },
  endBeforeStart: {
    id: 'rtp.recurrencerForm.endBeforeStart',
    defaultMessage: 'The end date must be after the begin'
  },
  countTooSmall: {
    id: 'rtp.recurrencerForm.countTooSmall',
    defaultMessage: 'Count must be greater than 0'
  },
  invalidMonthlyIntervalType: {
    id: 'rtp.recurrencerForm.invalidMonthlyIntervalType',
    defaultMessage: 'Invalid monthly interval type'
  },
  someDisabledValues: {
    id: 'rtp.recurrencerForm.someDisabledValues',
    defaultMessage: 'Some values are disabled'
  },
  forceSubmit: {
    id: 'rtp/recurrencerForm.forceSubmit',
    defaultMessage: 'Create anyway'
  }
} );

function isValidDate( d ) {
  return d instanceof Date && !isNaN( d );
}

function parseNumber( value ) {
  return value && parseInt( value );
}

function formatNumber( value ) {
  return (value ? '' + value : value);
}

function SelectField( { name, options, className, classNameSelect, ...selectProps } ) {
  return (
    <Field
      name={name}
      parse={val => val && val.value}
      format={val => options.find( o => o.value === val )}
      render={( { input, meta, ...rest } ) => (
        <Select
          {...input}
          {...rest}
          options={options}
          className={className}
          classNamePrefix={classNameSelect}
        />
      )}
      {...selectProps}
    />
  );
}

function NumberInput( { input, meta, intl, ...rest } ) {
  return (
    <MaskedInput
      {...input}
      {...rest}
      mask={numberMask}
    />
  );
}

function DateInput( { input, meta, label, classNamePrefix, intl, ...rest } ) {
  const derivedDateFormat = deriveDateFormat( intl )
    .split( '' )
    .map( v => {
      // Reverse MM and mm for text-maskv (see https://github.com/text-mask/text-mask/issues/951)
      switch ( v ) {
        case 'M':
          return 'm';
        case 'm':
          return 'M';
        default:
          return v;
      }
    } ).join( '' );

  const pipe = createAutoCorrectedDatePipe( derivedDateFormat );
  const mask = derivedDateFormat.split( '' ).map( char => (/[a-z]/gi.test( char ) ? /\d/ : char) );

  return (
    <section className={`${classNamePrefix}section`}>
      {label ? <div>{label}</div> : null}

      <MaskedInput
        {...input}
        {...rest}
        mask={mask}
        pipe={pipe}
        keepCharPositions
        className={`${classNamePrefix}input`}
      />

      {meta.touched && meta.error ? (
        <div className={`${classNamePrefix}input-error`}>
          {intl.formatMessage( messages[ meta.error ] )}
        </div>
      ) : null}
    </section>
  );
}

class WeekdayField extends Component {
  state = {
    selected: []
  };

  static getDerivedStateFromProps( props, state ) {
    const { value, intl, valueToDuplicate, weekStartsOn } = props;
    const derivedState = {};

    if ( value !== state.selected ) {
      derivedState.selected = value || state.selected;
    }

    if ( valueToDuplicate !== state.valueToDuplicate || weekStartsOn !== state.weekStartsOn ) {
      derivedState.valueToDuplicate = valueToDuplicate;
      derivedState.weekStartsOn = weekStartsOn;

      const weekdays = {
        long: [],
        short: []
      };
      const startDate = dateFns.startOfWeek( valueToDuplicate.begin, { weekStartsOn } );

      for ( let i = 0; i < 7; i++ ) {
        const day = dateFns.addDays( startDate, i );

        weekdays.long.push( intl.formatDate( day, { weekday: 'long' } ) );
        weekdays.short.push( intl.formatDate( day, { weekday: 'short' } ) );
      }

      derivedState.weekdays = weekdays;
    }

    if ( Object.keys( derivedState ).length ) {
      return derivedState;
    }

    return null;
  }

  localeUtils = {
    formatWeekdayLong: weekday => this.state.weekdays.long[ weekday ],
    formatWeekdayShort: weekday => this.state.weekdays.short[ weekday ]
  };

  modifiers = {
    selected: weekday => this.state.selected.includes( weekday )
  };

  handleWeekdayClick = ( e, value ) => {
    const { onChange } = this.props;
    const { selected } = this.state;

    const newValue = selected.includes( value )
      ? selected.filter( v => v !== value )
      : [ ...selected, value ].sort();

    this.setState(
      { selected: newValue },
      () => {
        if ( typeof onChange === 'function' ) {
          onChange( newValue );
        }
      }
    );
  };

  render() {
    const { classNamePrefix, locale } = this.props;

    return (
      <WeekdayPicker
        classNamePrefix={classNamePrefix}
        modifiers={this.modifiers}
        onWeekdayTouchTap={this.handleWeekdayClick}
        onWeekdayClick={this.handleWeekdayClick}
        locale={locale}
        localeUtils={this.localeUtils}
      />
    );
  }
}

class RecurrencerForm extends Component {
  subscription = { values: true, submitError: true, dirtySinceLastSubmit: true };

  mutators = { setFieldData };

  state = {
    initialValues: null,
    frequenceOptions: [
      { value: 'daily', label: this.props.intl.formatMessage( messages.day ) },
      { value: 'weekly', label: this.props.intl.formatMessage( messages.week ) },
      { value: 'monthly', label: this.props.intl.formatMessage( messages.month ) },
      { value: 'yearly', label: this.props.intl.formatMessage( messages.year ) }
    ],
    monthlyIntervalTypeOptions: []
  };

  static getDerivedStateFromProps( props, state ) {
    const { value, intl, valueToDuplicate, weekStartsOn } = props;
    const derivedState = {};

    if ( value !== state.selected ) {
      derivedState.selected = value || state.selected;
    }

    if ( valueToDuplicate !== state.valueToDuplicate || weekStartsOn !== state.weekStartsOn ) {
      const weekdayName = intl.formatDate( valueToDuplicate.begin, { weekday: 'long' } );
      const weekNumber = getWeekOfMonth( valueToDuplicate.begin );

      derivedState.valueToDuplicate = valueToDuplicate;
      derivedState.weekStartsOn = weekStartsOn;

      derivedState.monthlyIntervalTypeOptions = [
        {
          label: intl.formatMessage( messages.everyMonthByDate, { dayNumber: valueToDuplicate.begin.getDate() } ),
          value: 'date'
        },
        {
          label: intl.formatMessage( messages.everyMonthByWeekday, { weekNumber, weekday: weekdayName } ),
          value: 'weekday'
        }
      ];

      derivedState.initialValues = {
        frequence: 'weekly',
        interval: 1,
        endType: 'until',
        until: dateFns.endOfDay( dateFns.addYears( valueToDuplicate.begin, 1 ) ),
        count: 2
      };
    }

    if ( Object.keys( derivedState ).length ) {
      return derivedState;
    }

    return null;
  }

  parseUntil = value => {
    const { intl } = this.props;
    const dateFormat = deriveDateFormat( intl );

    return value && !value.includes( '_' )
      ? dateFns.endOfDay( new Date( getDateFromFormat( value, dateFormat ) ) )
      : value;
  };

  formatUntil = value => {
    const { intl } = this.props;

    return value && isValidDate( value )
      ? intl.formatDate( value, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        // hour:  'numeric',
        // minute: 'numeric',
        hour12: false
      } )
      : value;
  };

  handleSubmit = ( values, ...rest ) => {
    const { valueToDuplicate, onSubmit } = this.props;

    if ( ![ 'daily', 'weekly', 'monthly', 'yearly' ].includes( values.frequence ) ) {
      return { [ FORM_ERROR ]: 'invalidFrequence' };
    }

    if ( !Number.isInteger( values.interval ) || values.interval < 1 ) {
      return { [ FORM_ERROR ]: 'intervalTooSmall' };
    }

    if ( values.endType === 'until' ) {
      if ( !isValidDate( values.until ) ) {
        return { [ FORM_ERROR ]: 'invalidDate' };
      } else if ( valueToDuplicate.begin.getTime() >= values.until.getTime() ) {
        return { [ FORM_ERROR ]: 'endBeforeStart' };
      }
    }

    if ( values.endType === 'count' && !Number.isInteger( values.count ) || values.count < 1 ) {
      return { [ FORM_ERROR ]: 'countTooSmall' };
    }

    if ( values.frequence === 'monthly' && ![ 'date', 'weekday' ].includes( values.monthlyIntervalType ) ) {
      return { [ FORM_ERROR ]: 'invalidMonthlyIntervalType' };
    }

    if ( typeof onSubmit === 'function' ) {
      return onSubmit( values, ...rest );
    }
  };

  forceSubmit = form => {
    form.mutators.setFieldData( 'frequence', { forceTimingsCreation: true } );
    form.submit();
  };

  renderForm = ( {
    form,
    values,
    handleSubmit,
    submitError,
    dirtySinceLastSubmit,
    classNamePrefix,
    intl,
    valueToDuplicate,
    weekStartsOn
  } ) => {
    const { frequenceOptions, monthlyIntervalTypeOptions } = this.state;

    return (
      <form onSubmit={handleSubmit}>
        <h3>{intl.formatMessage( messages.title )}</h3>

        <div className={`${classNamePrefix}recurrencer-content`}>
          {intl.formatMessage( messages.repeatEvery )}{' '}

          <Field
            name="interval"
            component={NumberInput}
            autoComplete="off"
            type="number"
            parse={parseNumber}
            format={formatNumber}
            min={1}
            intl={intl}
            className={`${classNamePrefix}recurrencer-interval__input`}
          />

          {' '}

          <SelectField
            name="frequence"
            options={frequenceOptions}
            className={`${classNamePrefix}recurrencer-frequence`}
            classNameSelect={`${classNamePrefix}recurrencer-frequence__Select`}
            isSearchable={false}
            defaultValue="weekly"
            initialValue="weekly"
          />

          <br />

          {values.frequence === 'weekly' ? (
            <section className={`${classNamePrefix}recurrencer-weekday`}>
              {intl.formatMessage( messages.repeatThe )}<br />

              <Field
                name="weekday"
                classNamePrefix={classNamePrefix}
                intl={intl}
                valueToDuplicate={valueToDuplicate}
                weekStartsOn={weekStartsOn}
                initialValue={[ this.props.valueToDuplicate.begin.getDay() - this.props.weekStartsOn ]}
                render={( { input, meta, ...rest } ) => (
                  <WeekdayField {...input} {...rest} />
                )}
              />
            </section>
          ) : null}

          {values.frequence === 'monthly' ? (
            <SelectField
              name="monthlyIntervalType"
              options={monthlyIntervalTypeOptions}
              className={`${classNamePrefix}recurrencer-monthlyIntervalType`}
              classNameSelect={`${classNamePrefix}recurrencer-frequence__Select`}
              isSearchable={false}
              initialValue="date"
            />
          ) : null}

          <section className={`${classNamePrefix}recurrencer-ending`}>
            {intl.formatMessage( messages.ends )}<br />

            <div className={`${classNamePrefix}recurrencer-until__radio`}>
              <label htmlFor="endType-until" onClick={() => form.change( 'endType', 'until' )}>
                <Field
                  name="endType"
                  component="input"
                  type="radio"
                  id="endType-until"
                  value="until"
                  autoComplete="off"
                />

                {intl.formatMessage( messages.the )}{' '}

                <Field
                  name="until"
                  component={DateInput}
                  format={this.formatUntil}
                  parse={this.parseUntil}
                  autoComplete="off"
                  intl={intl}
                  classNamePrefix={`${classNamePrefix}recurrencer-until__`}
                />
              </label>
            </div>

            <div className={`${classNamePrefix}recurrencer-count__radio`}>
              <label htmlFor="endType-count" onClick={() => form.change( 'endType', 'count' )}>
                <Field
                  name="endType"
                  component="input"
                  type="radio"
                  id="endType-count"
                  value="count"
                  autoComplete="off"
                />

                {intl.formatMessage( messages.after )}{' '}

                <Field
                  name="count"
                  component={NumberInput}
                  autoComplete="off"
                  type="number"
                  parse={parseNumber}
                  format={formatNumber}
                  min={1}
                  intl={intl}
                  placeholder={2}
                  className={`${classNamePrefix}recurrencer-count__input`}
                />

                {' '}{intl.formatMessage( messages.occurrences )}
              </label>
            </div>
          </section>

          <div>
            <button type="submit">{intl.formatMessage( messages.submit )}</button>
          </div>

          {submitError && !dirtySinceLastSubmit ? (
            <div className={`${classNamePrefix}error`}>
              {intl.formatMessage( messages[ submitError.message ] )}

              {submitError.message === 'someDisabledValues'
              && submitError.disabledTimings
              && submitError.disabledTimings.length ? (
                <div className={`${classNamePrefix}recurrencer-error__disabledTimings`}>
                  <ul>
                    {submitError.disabledTimings.map( ( v, i ) => (
                      <li key={i}>
                        {intl.formatDate( v.begin )}
                      </li>
                    ) )}
                  </ul>

                  <button type="button" onClick={() => this.forceSubmit( form )}>
                    {intl.formatMessage( messages.forceSubmit )}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>
    );
  };

  render() {
    const {
      classNamePrefix,
      intl
    } = this.props;
    const {
      initialValues,
      valueToDuplicate,
      weekStartsOn
    } = this.state;

    return (
      <Form
        mutators={this.mutators}
        initialValues={initialValues}
        onSubmit={this.handleSubmit}
        subscription={this.subscription}
        render={this.renderForm}
        classNamePrefix={classNamePrefix}
        intl={intl}
        valueToDuplicate={valueToDuplicate}
        weekStartsOn={weekStartsOn}
      />
    );
  }
}

export default injectIntl( RecurrencerForm );
