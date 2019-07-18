import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Field, Form } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import setFieldData from 'final-form-set-field-data';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import dateFns from 'date-fns';
import SelectField from './SelectField';
import NumberInput from './NumberInput';
import DateInput from './DateInput';
import deriveDateFormat from './utils/deriveDateFormat';
import getDateFromFormat from './utils/getDateFromFormat';
import isValidDate from './utils/isValidDate';
import parseNumber from './utils/parseNumber';
import formatNumber from './utils/formatNumber';

const numberMask = createNumberMask( {
  prefix: '',
  integerLimit: 3
} );

const messages = defineMessages( {
  title: {
    id: 'rtp.multiRecurrencerForm.title',
    defaultMessage: 'Define a recurring timing'
  },
  day: {
    id: 'rtp.multiRecurrencerForm.day',
    defaultMessage: 'day'
  },
  week: {
    id: 'rtp.multiRecurrencerForm.week',
    defaultMessage: 'week'
  },
  month: {
    id: 'rtp.multiRecurrencerForm.month',
    defaultMessage: 'month'
  },
  submit: {
    id: 'rtp.multiRecurrencerForm.submit',
    defaultMessage: 'Apply'
  },
  repeatEvery: {
    id: 'rtp.multiRecurrencerForm.repeatEvery',
    defaultMessage: 'Repeat every'
  },
  repeatThe: {
    id: 'rtp.multiRecurrencerForm.repeatThe',
    defaultMessage: 'Repeat the'
  },
  the: {
    id: 'rtp.multiRecurrencerForm.the',
    defaultMessage: 'The'
  },
  after: {
    id: 'rtp.multiRecurrencerForm.after',
    defaultMessage: 'After'
  },
  occurrences: {
    id: 'rtp.multiRecurrencerForm.occurrences',
    defaultMessage: 'occurrences'
  },
  ends: {
    id: 'rtp.multiRecurrencerForm.ends',
    defaultMessage: 'Ends'
  },
  everyMonthByDate: {
    id: 'rtp.multiRecurrencerForm.everyMonthByDate',
    defaultMessage: 'Every month on the same dates'
  },
  everyMonthByWeekday: {
    id: 'rtp.multiRecurrencerForm.everyMonthByWeekday',
    defaultMessage: 'Every month week by week'
  },
  invalidFrequence: {
    id: 'rtp.multiRecurrencerForm.invalidFrequence',
    defaultMessage: 'Invalid frequence'
  },
  intervalTooSmall: {
    id: 'rtp.multiRecurrencerForm.intervalTooSmall',
    defaultMessage: 'Interval must be greater than 0'
  },
  invalidDate: {
    id: 'rtp.multiRecurrencerForm.invalidDate',
    defaultMessage: 'Invalid end date'
  },
  endBeforeStart: {
    id: 'rtp.multiRecurrencerForm.endBeforeStart',
    defaultMessage: 'The end date must be after the begin'
  },
  countTooSmall: {
    id: 'rtp.multiRecurrencerForm.countTooSmall',
    defaultMessage: 'Count must be greater than 0'
  },
  invalidMonthlyIntervalType: {
    id: 'rtp.multiRecurrencerForm.invalidMonthlyIntervalType',
    defaultMessage: 'Invalid monthly interval type'
  },
  someDisabledValues: {
    id: 'rtp.multiRecurrencerForm.someDisabledValues',
    defaultMessage: 'Some values are disabled'
  },
  forceSubmit: {
    id: 'rtp.multiRecurrencerForm.forceSubmit',
    defaultMessage: 'Create anyway'
  }
} );

class MultiRecurrencerForm extends Component {
  subscription = { values: true, submitError: true, dirtySinceLastSubmit: true };

  mutators = { setFieldData };

  state = {
    initialValues: null,
    frequenceOptions: [
      { value: 'weekly', label: this.props.intl.formatMessage( messages.week ) },
      { value: 'monthly', label: this.props.intl.formatMessage( messages.month ) }
    ],
    monthlyIntervalTypeOptions: [
      {
        label: this.props.intl.formatMessage( messages.everyMonthByDate ),
        value: 'date'
      },
      {
        label: this.props.intl.formatMessage( messages.everyMonthByWeekday ),
        value: 'weekday'
      }
    ]
  };

  static getDerivedStateFromProps( props, state ) {
    const { activeWeek } = props;
    const derivedState = {};

    if ( activeWeek !== state.activeWeek ) {
      derivedState.activeWeek = activeWeek;

      derivedState.initialValues = {
        frequence: 'weekly',
        interval: 1,
        endType: 'until',
        until: dateFns.endOfWeek( dateFns.addYears( activeWeek, 1 ) ),
        count: 2,
        monthlyIntervalType: 'weekday'
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
    const { activeWeek, weekStartsOn, onSubmit } = this.props;

    if ( ![ 'weekly', 'monthly' ].includes( values.frequence ) ) {
      return { [ FORM_ERROR ]: new Error( 'invalidFrequence' ) };
    }

    if ( !Number.isInteger( values.interval ) || values.interval < 1 ) {
      return { [ FORM_ERROR ]: new Error( 'intervalTooSmall' ) };
    }

    const minimumEnd = values.frequence === 'monthly'
      ? dateFns.endOfMonth( activeWeek )
      : dateFns.endOfWeek( activeWeek, { weekStartsOn } );

    if ( values.endType === 'until' ) {
      if ( !isValidDate( values.until ) ) {
        return { [ FORM_ERROR ]: new Error( 'invalidDate' ) };
      } else if ( values.until.getTime() <= minimumEnd.getTime() ) {
        return { [ FORM_ERROR ]: new Error( 'endBeforeStart' ) };
      }
    }

    if ( values.endType === 'count' && !Number.isInteger( values.count ) || values.count < 1 ) {
      return { [ FORM_ERROR ]: new Error( 'countTooSmall' ) };
    }

    if ( values.frequence === 'monthly' && ![ 'date', 'weekday' ].includes( values.monthlyIntervalType ) ) {
      return { [ FORM_ERROR ]: new Error( 'invalidMonthlyIntervalType' ) };
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
            mask={numberMask}
            parse={parseNumber}
            format={formatNumber}
            min={1}
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

          <SelectField
            visible={values.frequence === 'monthly'}
            name="monthlyIntervalType"
            options={monthlyIntervalTypeOptions}
            className={`${classNamePrefix}recurrencer-monthlyIntervalType`}
            classNameSelect={`${classNamePrefix}recurrencer-frequence__Select`}
            isSearchable={false}
            initialValue="date"
          />

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
                  mask={numberMask}
                  parse={parseNumber}
                  format={formatNumber}
                  min={1}
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
      activeWeek,
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
        activeWeek={activeWeek}
        weekStartsOn={weekStartsOn}
      />
    );
  }
}

export default injectIntl( MultiRecurrencerForm );
