import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Field, Form } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import setFieldData from 'final-form-set-field-data';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import dateFns from 'date-fns';
import { FaRegTimesCircle } from 'react-icons/fa';
import SelectField from './SelectField';
import WeekdayInput from './WeekdayInput';
import NumberInput from './NumberInput';
import DatePickerInput from './DatePickerInput';
import getWeekOfMonth from './utils/getWeekOfMonth';
import isValidDate from './utils/isValidDate';
import parseNumber from './utils/parseNumber';
import formatNumber from './utils/formatNumber';

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
    id: 'rtp.recurrencerForm.forceSubmit',
    defaultMessage: 'Create anyway'
  },
  dailyCount: {
    id: 'rtp.recurrencerForm.dailyCount',
    defaultMessage: '{count, plural, one {day} other {days} }'
  },
  weeklyCount: {
    id: 'rtp.recurrencerForm.weeklyCount',
    defaultMessage: '{count, plural, one {week} other {weeks} }'
  },
  monthlyCount: {
    id: 'rtp.recurrencerForm.monthlyCount',
    defaultMessage: '{count, plural, one {month} other {months} }'
  }
} );

class RecurrencerForm extends Component {
  subscription = { values: true, submitError: true, dirtySinceLastSubmit: true };

  mutators = { setFieldData };

  state = {
    initialValues: null,
    frequenceOptions: [
      { value: 'daily', label: this.props.intl.formatMessage( messages.day ) },
      { value: 'weekly', label: this.props.intl.formatMessage( messages.week ) },
      { value: 'monthly', label: this.props.intl.formatMessage( messages.month ) }
    ],
    monthlyIntervalTypeOptions: []
  };

  static getDerivedStateFromProps( props, state ) {
    const { intl, valueToDuplicate, weekStartsOn } = props;
    const derivedState = {};

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
        weekday: [ valueToDuplicate.begin.getDay() - weekStartsOn ],
        interval: 1,
        endType: 'until',
        until: dateFns.endOfDay( dateFns.addMonths( valueToDuplicate.begin, 1 ) ),
        count: 2,
        monthlyIntervalType: 'date'
      };
    }

    if ( Object.keys( derivedState ).length ) {
      return derivedState;
    }

    return null;
  }

  handleSubmit = ( values, ...rest ) => {
    const { valueToDuplicate, onSubmit } = this.props;

    if ( ![ 'daily', 'weekly', 'monthly' ].includes( values.frequence ) ) {
      return { [ FORM_ERROR ]: new Error( 'invalidFrequence' ) };
    }

    if ( !Number.isInteger( values.interval ) || values.interval < 1 ) {
      return { [ FORM_ERROR ]: new Error( 'intervalTooSmall' ) };
    }

    if ( values.endType === 'until' ) {
      if ( !isValidDate( values.until ) ) {
        return { [ FORM_ERROR ]: new Error( 'invalidDate' ) };
      } else if ( values.until.getTime() <= valueToDuplicate.begin.getTime() ) {
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
    valueToDuplicate,
    weekStartsOn,
    closeModal,
    onDayPickerHide
  } ) => {
    const { frequenceOptions, monthlyIntervalTypeOptions } = this.state;

    return (
      <form onSubmit={handleSubmit}>
        <h3>{intl.formatMessage( messages.title )}</h3>

        {typeof closeModal === 'function' ? (
          <div className={`${classNamePrefix}close-modal`}>
            <FaRegTimesCircle onClick={closeModal} />
          </div>
        ) : null}

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
          />

          <br />

          {/*{values.frequence === 'weekly' ? (*/}
            <section className={`${classNamePrefix}recurrencer-weekday`}>
              {intl.formatMessage( messages.repeatThe )}<br />

              <Field
                visible={values.frequence === 'weekly'}
                name="weekday"
                classNamePrefix={classNamePrefix}
                intl={intl}
                valueToDuplicate={valueToDuplicate}
                weekStartsOn={weekStartsOn}
                component={WeekdayInput}
              />
            </section>
          {/*) : null}*/}

          {/*{values.frequence === 'monthly' ? (*/}
          <SelectField
            visible={values.frequence === 'monthly'}
            name="monthlyIntervalType"
            options={monthlyIntervalTypeOptions}
            className={`${classNamePrefix}recurrencer-monthlyIntervalType`}
            classNameSelect={`${classNamePrefix}recurrencer-frequence__Select`}
            isSearchable={false}
          />
          {/*) : null}*/}

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
                  component={DatePickerInput}
                  autoComplete="off"
                  intl={intl}
                  classNamePrefix={`${classNamePrefix}recurrencer-until__`}
                  weekStartsOn={weekStartsOn}
                  onDayPickerHide={onDayPickerHide}
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

                {' '}

                {values.frequence === 'daily'
                  ? intl.formatMessage( messages.dailyCount, { count: values.count } )
                  : null}
                {values.frequence === 'weekly'
                  ? intl.formatMessage( messages.weeklyCount, { count: values.count } )
                  : null}
                {values.frequence === 'monthly'
                  ? intl.formatMessage( messages.monthlyCount, { count: values.count } )
                  : null}
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
      intl,
      closeModal,
      onDayPickerHide
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
        closeModal={closeModal}
        onDayPickerHide={onDayPickerHide}
      />
    );
  }
}

export default injectIntl( RecurrencerForm );
