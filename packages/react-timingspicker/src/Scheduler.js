import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import ReactModal from 'react-modal';
import { FORM_ERROR } from 'final-form';
import dateFns from 'date-fns';
import RRule from 'rrule';
import DaysSelector from './DaysSelector';
import EditForm from './EditForm';
import RecurrencerForm from './RecurrencerForm';
import getWeekOfMonth from './utils/getWeekOfMonth';
import convertUTCDateToLocalDate from './utils/convertUTCDateToLocalDate';
import convertLocalDateToUTCDate from './utils/convertLocalDateToUTCDate';

const ONE_DAY = 60 * 60 * 24;

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

    if ( !( values.frequence === 'weekly' && !values.weekday.includes( beginWeekdayIndex ) ) ) {
      countOffset += 1;
    }

    const count = values.endType === 'count' ? values.count + countOffset : undefined;
    const until = values.endType === 'until' ? values.until : undefined
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
  };

  handleRecurrencerSubmit = ( values, form ) => {
    const timings = this.recurrencerValuesToTimings( values );
    const selectorEl = this.selectorRef.current._wrappedInstance;
    const { forceTimingsCreation } = form.getFieldState( 'frequence' ).data;

    try {
      selectorEl.addValues( timings, forceTimingsCreation );
    } catch ( e ) {
      return { [FORM_ERROR]: e };
    }

    this.handleCloseRecurrencerModal();
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
          {showRecurrencerModal ? <RecurrencerForm
            weekStartsOn={weekStartsOn}
            onSubmit={this.handleRecurrencerSubmit}
            classNamePrefix={classNamePrefix}
            valueToDuplicate={valueToDuplicate}
            weekStartsOn={weekStartsOn}
          /> : null}
        </ReactModal>
      </>
    );
  }
}

export default injectIntl( Scheduler, { withRef: true } );
