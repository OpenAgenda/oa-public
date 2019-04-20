import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import ReactModal from 'react-modal';
import { FORM_ERROR } from 'final-form';
import dateFns from 'date-fns';
import DaysSelector from './DaysSelector';
import EditForm from './EditForm';

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
    defaultScroll: 8 * 40, // 8 hours * cellHeight
    modalStyle: {
      overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)'
      },
      content: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '25%',
        height: '65%',
        minWidth: '190px',
        transform: 'translate(-50%,-50%)',
        border: '1px solid rgb(204, 204, 204)',
        background: 'rgb(255, 255, 255)',
        overflow: 'auto',
        borderRadius: '4px',
        outline: 'none',
        padding: '12px'
      }
    }
  };

  state = {
    showModal: false,
    beforeSchedulerOverflows: null,
    beforeSchedulerPaddingRight: null,
    schedulerScroll: {
      x: null,
      y: null
    },
    valueToEdit: null,
    editInitialValues: null
  };

  schedulerRef = React.createRef();

  selectorRef = React.createRef();

  componentDidMount() {
    const { defaultScroll } = this.props;
    const schedulerEl = this.schedulerRef.current;

    schedulerEl.scrollTop = defaultScroll;
  }

  // componentWillUnmount() {
  //   document.removeEventListener( 'click', this.handleOutsideClick, false );
  // }

  getModalParent = () => this.schedulerRef.current;

  openEditModal = valueToEdit => this.setState( {
    showModal: true,
    valueToEdit,
    editInitialValues: {
      begin: dateFns.format( valueToEdit.begin, 'HH:mm' ),
      end: dateFns.format( valueToEdit.end, 'HH:mm' ) //
    }
  } );

  handleOpenModal = () => {
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

  handleCloseModal = () => {
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
      showModal: false,
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
  //   this.handleCloseModal();
  // };

  handleEditSubmit = value => {
    const { valueToEdit } = this.state;
    const selectorEl = this.selectorRef.current._wrappedInstance;
    const { begin, end } = value;
    const [ beginHours, beginMinutes ] = begin.split( ':' );
    const [ endHours, endMinutes ] = end.split( ':' );

    const newValue = {
      begin: dateFns.setHours(
        dateFns.setMinutes( valueToEdit.begin, parseInt( beginMinutes, 10 ) ),
        parseInt( beginHours, 10 )
      ),
      end: dateFns.setHours(
        dateFns.setMinutes( valueToEdit.end, parseInt( endMinutes, 10 ) ),
        parseInt( endHours, 10 )
      )
    };

    if ( !dateFns.isAfter( newValue.end, newValue.begin ) ) {
      return Promise.resolve( {
        [ FORM_ERROR ]: 'endNotAfterBegin'
      } );
    }

    selectorEl.updateValue(
      valueToEdit,
      newValue
    );

    this.handleCloseModal();
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
      modalStyle,
      allowedTimings,
      breakpoint,
      classNamePrefix,
      intl
    } = this.props;
    const { showModal, schedulerScroll, editInitialValues } = this.state;

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
          isOpen={showModal}
          ariaHideApp={false}
          parentSelector={this.getModalParent}
          style={modalStyle}
          onAfterOpen={this.handleOpenModal}
          onRequestClose={this.handleCloseModal}
          shouldFocusAfterRender={false}
        >
          <EditForm
            initialValues={editInitialValues}
            onSubmit={this.handleEditSubmit}
            classNamePrefix={classNamePrefix}
          />
        </ReactModal>
      </>
    );
  }
}

export default injectIntl( Scheduler, { withRef: true } );
