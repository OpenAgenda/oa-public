import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import ReactModal from 'react-modal';
import { FORM_ERROR } from 'final-form';
import dateFns from 'date-fns';
import RRule from 'rrule';
import DaysSelector from './DaysSelector';
import EditForm from './EditForm';
import RecurrencerForm from './RecurrencerForm';
import MultiRecurrencerForm from './MultiRecurrencerForm';
import getWeekOfMonth from './utils/getWeekOfMonth';
import convertUTCDateToLocalDate from './utils/convertUTCDateToLocalDate';
import convertLocalDateToUTCDate from './utils/convertLocalDateToUTCDate';

const ONE_DAY = 60 * 60 * 24;

function duplicateTiming( timing, options ) {
  const rule = new RRule( {
    wkst: options.wkst,
    dtstart: convertLocalDateToUTCDate( timing.begin ),
    freq: RRule[ options.frequence.toUpperCase() ],
    interval: options.interval,
    count: options.count,
    until: options.until,
    byweekday: options.byweekday,
    bymonthday: options.bymonthday,
    bysetpos: options.bysetpos
  } );

  const begins = rule.all()
    .map( convertUTCDateToLocalDate )
    .filter( v => v.getTime() !== timing.begin.getTime() );
  const duration = timing.end.getTime() - timing.begin.getTime();

  return begins.map( v => ({
    begin: v,
    end: new Date( v.getTime() + duration )
  }) );
}

function getScrollbarWidth( elem ) {
  if ( elem ) {
    return elem.offsetWidth - elem.clientWidth;
  }

  return window.innerWidth - document.documentElement.clientWidth;
}

function Weekdays( { activeWeek, weekStartsOn, classNamePrefix, intl } ) {
  const days = [];
  const startDate = dateFns.startOfWeek( activeWeek, { weekStartsOn } );

  for ( let i = 0; i < 7; i++ ) {
    days.push(
      <div className={`${classNamePrefix}col`} key={i}>
        {intl.formatDate( dateFns.addDays( startDate, i ), { weekday: 'long' } )}<br />
        {intl.formatDate( dateFns.addDays( startDate, i ), { day: 'numeric' } )}
      </div>
    );
  }

  return (
    <div className={`${classNamePrefix}days`}>
      <div className={`${classNamePrefix}index-column`} />
      <div className={`${classNamePrefix}content-column`}>
        <div className={`${classNamePrefix}row`}>
          {days}
        </div>
      </div>
    </div>
  );
}

function Timetable( props ) {
  const { activeWeek, step, timingFormat, cellHeight, classNamePrefix } = props;
  const timings = [];
  let actual = dateFns.startOfDay( activeWeek );

  for ( let j = 0; j < ONE_DAY; j += step ) {
    const formattedDate = dateFns.format( actual, timingFormat );

    timings.push(
      <div
        key={actual}
        className={`${classNamePrefix}cell ${classNamePrefix}timing`}
        style={{ height: `${cellHeight}px` }}
      >
        <span className={`${classNamePrefix}number`}>{formattedDate}</span>
      </div>
    );

    actual = dateFns.addSeconds( actual, step );
  }

  return (
    <div className={`${classNamePrefix}column-timing`}>
      {timings}
    </div>
  );
}

class Scheduler extends Component {
  static defaultProps = {
    step: 60 * 60,
    timingFormat: 'HH:mm',
    cellHeight: 40,
    timingLimit: ONE_DAY,
    defaultScroll: 8 * 40 // 8 hours * cellHeight
  };

  state = {
    showEditModal: false,
    showRecurrencerModal: false,
    showMultiRecurrencerModal: false,
    modalStyle: {
      overlay: {}
    },
    beforeSchedulerOverflows: null,
    beforeSchedulerPaddingRight: null,
    schedulerScroll: {
      x: null,
      y: null
    },
    valueToEdit: null,
    valueToDuplicate: null,
    editInitialValues: null
  };

  schedulerRef = React.createRef();

  selectorRef = React.createRef();

  editModalRef = React.createRef();

  recurrencerModalRef = React.createRef();

  multiRecurrencerModalRef = React.createRef();

  componentDidMount() {
    const { defaultScroll } = this.props;
    const schedulerEl = this.schedulerRef.current;

    schedulerEl.scrollTop = defaultScroll;
  }

  componentWillUnmount() {
    // document.removeEventListener( 'click', this.handleOutsideClick, false );

    // https://github.com/reactjs/react-modal/pull/750
    this.editModalRef.current.node = null;
    this.recurrencerModalRef.current.node = null;
    this.multiRecurrencerModalRef.current.node = null;
  }

  getModalParent = () => this.schedulerRef.current;

  startLockScroll = () => {
    // if already locked
    if ( this.state.beforeSchedulerOverflows ) {
      return;
    }

    const schedulerEl = this.schedulerRef.current;
    const schedulerStyle = schedulerEl.style;
    const beforeSchedulerOverflows = {
      overflow: schedulerStyle.overflow,
      overflowX: schedulerStyle.overflowX,
      overflowY: schedulerStyle.overflowY,
    };
    const beforeSchedulerPaddingRight = schedulerStyle.paddingRight || 0;
    const scrollbarWidth = getScrollbarWidth( schedulerEl );

    Object.assign( schedulerStyle, {
      overflowY: 'hidden',
      paddingRight: `${scrollbarWidth}px`
    } );

    this.setState( {
      schedulerScroll: {
        x: schedulerEl.scrollLeft,
        y: schedulerEl.scrollTop
      },
      beforeSchedulerOverflows,
      beforeSchedulerPaddingRight
    } );

    this.schedulerRef.current.addEventListener( 'scroll', this.lockSchedulerScroll, false );

    // document.addEventListener( 'click', this.handleOutsideClick, false );
  }

  stopLockScroll = () => {
    const { beforeSchedulerOverflows, beforeSchedulerPaddingRight } = this.state;
    const schedulerEl = this.schedulerRef.current;

    Object.assign(
      schedulerEl.style,
      beforeSchedulerOverflows,
      {
        paddingRight: beforeSchedulerPaddingRight
      }
    );

    this.setState( {
      schedulerScroll: {
        x: 0,
        y: 0
      },
      beforeSchedulerOverflows: null
    } );

    schedulerEl.removeEventListener( 'scroll', this.lockSchedulerScroll, false );

    // document.removeEventListener( 'click', this.handleOutsideClick, false );
  }

  lockSchedulerScroll = () => {
    const { schedulerScroll: { x, y } } = this.state;
    const schedulerEl = this.schedulerRef.current;

    const diff = {
      x: schedulerEl.scrollLeft - x,
      y: schedulerEl.scrollTop - y
    };

    if ( diff.x === 0 && diff.y === 0 ) {
      return;
    }

    schedulerEl.scrollLeft = x;
    schedulerEl.scrollTop = y;
  }

  // handleOutsideClick = e => {
  //   if ( this.schedulerRef.current.contains( e.target ) ) {
  //     return;
  //   }
  //
  //   this.handleCloseEditModal();
  // };

  openEditModal = valueToEdit => this.setState( {
    showEditModal: true,
    valueToEdit,
    editInitialValues: {
      begin: dateFns.format( valueToEdit.begin, 'HH:mm' ),
      end: dateFns.format( valueToEdit.end, 'HH:mm' )
    }
  } );

  openRecurrencerModal = () => this.setState( {
    showEditModal: false,
    valueToEdit: null,
    showRecurrencerModal: true,
    valueToDuplicate: this.state.valueToEdit
  } );

  openMultiRecurrencerModal = () => this.setState( {
    showEditModal: false,
    valueToEdit: null,
    showRecurrencerModal: false,
    valueToDuplicate: null,
    showMultiRecurrencerModal: true
  } );

  handleCloseEditModal = () => {
    this.stopLockScroll();

    this.setState( {
      showEditModal: false,
      valueToEdit: null
    } );
  };

  handleCloseRecurrencerModal = () => {
    this.stopLockScroll();

    this.setState( {
      showRecurrencerModal: false,
      valueToDuplicate: null
    } );
  };

  handleCloseMultiRecurrencerModal = () => {
    this.stopLockScroll();

    this.setState( {
      showMultiRecurrencerModal: false
    } );
  };

  handleEditSubmit = value => {
    const { valueToEdit } = this.state;
    const selectorEl = this.selectorRef.current._wrappedInstance;

    selectorEl.updateValue( valueToEdit, value );

    this.handleCloseEditModal();
  };

  recurrencerValuesToTimings = values => {
    const { weekStartsOn } = this.props;
    const { valueToDuplicate } = this.state;

    const UTCweekdays = [ 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA' ];
    const weekdays = [
      ...UTCweekdays.slice( weekStartsOn ),
      ...UTCweekdays.slice( 0, weekStartsOn )
    ];

    const beginWeekdayIndex = valueToDuplicate.begin.getUTCDay();
    const beginWeekday = RRule[ UTCweekdays[ beginWeekdayIndex ] ];
    const wkst = RRule[ UTCweekdays[ weekStartsOn ] ];
    let countOffset = 0;

    if ( !(values.frequence === 'weekly' && !values.weekday.includes( beginWeekdayIndex )) ) {
      countOffset = 1;
    }

    const count = values.endType === 'count' ? values.count + countOffset : undefined;
    const until = values.endType === 'until' ? values.until : undefined;
    const byweekday = values.frequence === 'weekly' && values.weekday && values.weekday.length
      ? values.weekday.map( v => RRule[ weekdays[ v ] ] )
      : values.frequence === 'monthly' && values.monthlyIntervalType === 'weekday'
        ? beginWeekday
        : undefined;
    const bymonthday = values.frequence === 'monthly' && values.monthlyIntervalType === 'date'
      ? valueToDuplicate.begin.getDate()
      : undefined;
    const bysetpos = values.frequence === 'monthly' && values.monthlyIntervalType === 'weekday'
      ? getWeekOfMonth( valueToDuplicate.begin )
      : undefined;

    return duplicateTiming( valueToDuplicate, {
      wkst,
      frequence: values.frequence,
      interval: values.interval,
      count,
      until,
      byweekday,
      bymonthday,
      bysetpos
    } );
  };

  extractTimings = frequence => {
    const { value, activeWeek, weekStartsOn } = this.props;

    const start = frequence === 'monthly'
      ? dateFns.startOfMonth( activeWeek )
      : dateFns.startOfWeek( activeWeek, { weekStartsOn } );
    const end = frequence === 'monthly'
      ? dateFns.endOfMonth( activeWeek )
      : dateFns.endOfWeek( activeWeek, { weekStartsOn } );

    const startTime = start.getTime();
    const endTime = end.getTime();

    return value
      .filter( timing => {
        const beginTime = timing.begin.getTime();

        return (beginTime >= startTime && beginTime <= endTime);
      } );
  };

  multiRecurrencerValuesToTimings = values => {
    const { weekStartsOn } = this.props;

    const UTCweekdays = [ 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA' ];
    const weekdays = [
      ...UTCweekdays.slice( weekStartsOn ),
      ...UTCweekdays.slice( 0, weekStartsOn )
    ];

    const valuesToDuplicate = this.extractTimings( values.frequence );

    return valuesToDuplicate
      .map( valueToDuplicate => {
        const beginWeekdayIndex = valueToDuplicate.begin.getUTCDay();
        const beginWeekday = RRule[ UTCweekdays[ beginWeekdayIndex ] ];
        const wkst = RRule[ UTCweekdays[ weekStartsOn ] ];
        const weekday = [ valueToDuplicate.begin.getDay() - weekStartsOn ];
        let countOffset = 0;

        if ( !(values.frequence === 'weekly' && !weekday.includes( beginWeekdayIndex )) ) {
          countOffset = 1;
        }

        const count = values.endType === 'count' ? values.count + countOffset : undefined;
        const until = values.endType === 'until' ? values.until : undefined;
        const byweekday = values.frequence === 'weekly' && weekday && weekday.length
          ? weekday.map( v => RRule[ weekdays[ v ] ] )
          : values.frequence === 'monthly' && values.monthlyIntervalType === 'weekday'
            ? beginWeekday
            : undefined;
        const bymonthday = values.frequence === 'monthly' && values.monthlyIntervalType === 'date'
          ? valueToDuplicate.begin.getDate()
          : undefined;
        const bysetpos = values.frequence === 'monthly' && values.monthlyIntervalType === 'weekday'
          ? getWeekOfMonth( valueToDuplicate.begin )
          : undefined;

        const rule = new RRule( {
          wkst,
          dtstart: convertLocalDateToUTCDate( valueToDuplicate.begin ),
          freq: RRule[ values.frequence.toUpperCase() ],
          interval: values.interval,
          count,
          until,
          byweekday,
          bymonthday,
          bysetpos
        } );

        const begins = rule.all()
          .map( convertUTCDateToLocalDate )
          .filter( v => v.getTime() !== valueToDuplicate.begin.getTime() );
        const duration = valueToDuplicate.end.getTime() - valueToDuplicate.begin.getTime();
        const newValues = begins.map( v => ({
          begin: v,
          end: new Date( v.getTime() + duration )
        }) );

        return newValues;
      } );
  };

  handleRecurrencerSubmit = ( values, form ) => {
    const timings = this.recurrencerValuesToTimings( values );
    const selectorEl = this.selectorRef.current._wrappedInstance;
    const { forceTimingsCreation } = form.getFieldState( 'frequence' ).data;

    try {
      selectorEl.addValues( timings, forceTimingsCreation );
    } catch ( e ) {
      return { [ FORM_ERROR ]: e };
    }

    this.handleCloseRecurrencerModal();
  };

  handleMultiRecurrencerSubmit = ( values, form ) => {
    const timings = this.multiRecurrencerValuesToTimings( values ).flat();
    const selectorEl = this.selectorRef.current._wrappedInstance;
    const { forceTimingsCreation } = form.getFieldState( 'frequence' ).data;

    try {
      selectorEl.addValues( timings, forceTimingsCreation );
    } catch ( e ) {
      return { [ FORM_ERROR ]: e };
    }

    this.handleCloseMultiRecurrencerModal();
  };

  render() {
    const {
      activeWeek,
      weekStartsOn,
      value,
      onChange,
      step,
      timingFormat,
      cellHeight,
      timingLimit,
      defaultScroll,
      allowedTimings,
      breakpoint,
      classNamePrefix,
      intl
    } = this.props;
    const {
      modalStyle,
      showEditModal,
      showRecurrencerModal,
      showMultiRecurrencerModal,
      schedulerScroll,
      editInitialValues,
      valueToEdit,
      valueToDuplicate
    } = this.state;

    modalStyle.overlay.top = `${schedulerScroll.y}px`;

    return (
      <>
        <Weekdays
          activeWeek={activeWeek}
          weekStartsOn={weekStartsOn}
          classNamePrefix={classNamePrefix}
          intl={intl}
        />

        <div ref={this.schedulerRef} className={`${classNamePrefix}scheduler`}>
          <div className={`${classNamePrefix}index-column`}>
            <Timetable
              activeWeek={activeWeek}
              step={step}
              timingFormat={timingFormat}
              cellHeight={cellHeight}
              classNamePrefix={classNamePrefix}
            />
          </div>

          <div className={`${classNamePrefix}content-column`}>
            <DaysSelector
              ref={this.selectorRef}
              activeWeek={activeWeek}
              weekStartsOn={weekStartsOn}
              value={value}
              onChange={onChange}
              openEditModal={this.openEditModal}
              cellHeight={cellHeight}
              step={step}
              selectableStep={step / 2}
              timingLimit={timingLimit}
              defaultScroll={defaultScroll}
              allowedTimings={allowedTimings}
              classNamePrefix={classNamePrefix}
              breakpoint={breakpoint}
            />
          </div>
        </div>

        <div
          className={`${classNamePrefix}multi-recurrencer-button`}
          role="button"
          onClick={this.openMultiRecurrencerModal}
        >
          <FormattedMessage
            id="rtp.scheduler.openMultiRecurrencerModal"
            defaultMessage="Define a recurring timings"
          />
        </div>

        <ReactModal
          ref={this.editModalRef}
          isOpen={showEditModal}
          ariaHideApp={false}
          parentSelector={this.getModalParent}
          className={`${classNamePrefix}modal ${classNamePrefix}edit-modal`}
          overlayClassName={`${classNamePrefix}overlay`}
          style={modalStyle}
          onAfterOpen={this.startLockScroll}
          onRequestClose={this.handleCloseEditModal}
          shouldFocusAfterRender={false}
        >
          {showEditModal ? <EditForm
            initialValues={editInitialValues}
            onSubmit={this.handleEditSubmit}
            classNamePrefix={classNamePrefix}
            openRecurrencerModal={this.openRecurrencerModal}
            valueToEdit={valueToEdit}
          /> : null}
        </ReactModal>

        <ReactModal
          ref={this.recurrencerModalRef}
          isOpen={showRecurrencerModal}
          ariaHideApp={false}
          parentSelector={this.getModalParent}
          className={`${classNamePrefix}modal ${classNamePrefix}recurrencer-modal`}
          overlayClassName={`${classNamePrefix}overlay`}
          style={modalStyle}
          onAfterOpen={this.startLockScroll}
          onRequestClose={this.handleCloseRecurrencerModal}
          shouldFocusAfterRender={false}
        >
          {showRecurrencerModal ? (
            <RecurrencerForm
              weekStartsOn={weekStartsOn}
              onSubmit={this.handleRecurrencerSubmit}
              classNamePrefix={classNamePrefix}
              valueToDuplicate={valueToDuplicate}
            />
          ) : null}
        </ReactModal>

        <ReactModal
          ref={this.multiRecurrencerModalRef}
          isOpen={showMultiRecurrencerModal}
          ariaHideApp={false}
          parentSelector={this.getModalParent}
          className={`${classNamePrefix}modal ${classNamePrefix}multi-recurrencer-modal`}
          overlayClassName={`${classNamePrefix}overlay`}
          style={modalStyle}
          onAfterOpen={this.startLockScroll}
          onRequestClose={this.handleCloseMultiRecurrencerModal}
          shouldFocusAfterRender={false}
        >
          {showMultiRecurrencerModal ? (
            <MultiRecurrencerForm
              weekStartsOn={weekStartsOn}
              activeWeek={activeWeek}
              onSubmit={this.handleMultiRecurrencerSubmit}
              classNamePrefix={classNamePrefix}
            />
          ) : null}
        </ReactModal>
      </>
    );
  }
}

export default injectIntl( Scheduler, { withRef: true } );
