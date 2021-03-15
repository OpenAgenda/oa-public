import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import ReactModal from 'react-modal';
import { FORM_ERROR } from 'final-form';
import * as dateFns from 'date-fns';
import DaysSelector from './DaysSelector';
import EditForm from './EditForm';
import RecurrencerForm from './RecurrencerForm';
import MultiRecurrencerForm from './MultiRecurrencerForm';
import duplicateTiming from './utils/duplicateTiming';

const ONE_DAY = 60 * 60 * 24;

function getScrollbarWidth(elem) {
  if (elem) {
    return elem.offsetWidth - elem.clientWidth;
  }

  return window.innerWidth - document.documentElement.clientWidth;
}

function Weekdays({
  activeWeek, weekStartsOn, classNamePrefix, intl
}) {
  const days = [];
  const startDate = dateFns.startOfWeek(activeWeek, { weekStartsOn });

  for (let i = 0; i < 7; i++) {
    days.push(
      <div className={`${classNamePrefix}col`} key={i}>
        {intl.formatDate(dateFns.addDays(startDate, i), { weekday: 'long' })}
        <br />
        {intl.formatDate(dateFns.addDays(startDate, i), { day: 'numeric' })}
      </div>
    );
  }

  return (
    <div className={`${classNamePrefix}days`}>
      <div className={`${classNamePrefix}index-column`} />
      <div className={`${classNamePrefix}content-column`}>
        <div className={`${classNamePrefix}row`}>{days}</div>
      </div>
    </div>
  );
}

function Timetable(props) {
  const {
    activeWeek, step, timingFormat, cellHeight, classNamePrefix
  } = props;
  const timings = [];
  let cursor = dateFns.startOfDay(activeWeek);
  // no DST in first of january
  cursor.setMonth(0);
  cursor.setDate(1);

  for (let j = 0; j < ONE_DAY; j += step) {
    const formattedDate = dateFns.format(cursor, timingFormat);

    timings.push(
      <div
        key={cursor}
        className={`${classNamePrefix}cell ${classNamePrefix}timing`}
        style={{ height: `${cellHeight}px` }}
      >
        <span className={`${classNamePrefix}number`}>{formattedDate}</span>
      </div>
    );

    cursor = dateFns.addSeconds(cursor, step);
  }

  return <div className={`${classNamePrefix}column-timing`}>{timings}</div>;
}

class Scheduler extends Component {
  static defaultProps = {
    step: 60 * 60,
    timingFormat: 'HH:mm',
    cellHeight: 40,
    timingLimit: ONE_DAY,
    editOnClick: true,
  };

  schedulerRef = React.createRef();

  selectorRef = React.createRef();

  editModalRef = React.createRef();

  recurrencerModalRef = React.createRef();

  multiRecurrencerModalRef = React.createRef();

  recurrencerCloserTimeoutId = null;

  multiRecurrencerCloserTimeoutId = null;

  constructor(props) {
    super(props);

    this.state = {
      showEditModal: false,
      showRecurrencerModal: false,
      showMultiRecurrencerModal: false,
      modalStyle: {
        overlay: {},
      },
      beforeSchedulerOverflows: null,
      beforeSchedulerPaddingRight: null,
      schedulerScroll: {
        x: null,
        y: null,
      },
      valueToEdit: null,
      valueToDuplicate: null,
      editInitialValues: null,
    };
  }

  componentDidMount() {
    const { cellHeight, valueToHighlight } = this.props;
    const schedulerEl = this.schedulerRef.current;
    const defaultScroll = 8 * cellHeight; // 8 hours * cellHeight

    schedulerEl.scrollTop = valueToHighlight
      ? this.dateToScrollTopPos(valueToHighlight)
      : defaultScroll;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, true);

    // https://github.com/reactjs/react-modal/pull/750
    this.editModalRef.current.node = null;
    this.recurrencerModalRef.current.node = null;
    this.multiRecurrencerModalRef.current.node = null;
  }

  dateToScrollTopPos = date => {
    const { step, cellHeight } = this.props;
    const secondsFromStart = date.getHours() * 60 * 60 + date.getMinutes() * 60;
    const schedulerEl = this.schedulerRef.current;

    const scrollTop = (secondsFromStart / step) * cellHeight - schedulerEl.offsetHeight / 2;

    if (scrollTop > schedulerEl.scrollHeight) {
      return schedulerEl.scrollHeight;
    }

    if (scrollTop < 0) {
      return 0;
    }

    return scrollTop;
  };

  getModalParent = () => this.schedulerRef.current;

  startLockScroll = () => {
    const { beforeSchedulerOverflows: alreadyLocked } = this.state;
    // if already locked
    if (alreadyLocked) {
      return;
    }

    const schedulerEl = this.schedulerRef.current;
    const schedulerStyle = schedulerEl.style;
    const beforeSchedulerPaddingRight = schedulerStyle.paddingRight || 0;
    const scrollbarWidth = getScrollbarWidth(schedulerEl);

    const beforeSchedulerOverflows = {
      overflow: schedulerStyle.overflow,
      overflowX: schedulerStyle.overflowX,
      overflowY: schedulerStyle.overflowY,
    };

    Object.assign(schedulerStyle, {
      overflowY: 'hidden',
      paddingRight: `${scrollbarWidth}px`,
    });

    this.setState({
      schedulerScroll: {
        x: schedulerEl.scrollLeft,
        y: schedulerEl.scrollTop,
      },
      beforeSchedulerOverflows,
      beforeSchedulerPaddingRight,
    });

    this.schedulerRef.current.addEventListener(
      'scroll',
      this.lockSchedulerScroll,
      false
    );
  };

  stopLockScroll = () => {
    const {
      beforeSchedulerOverflows,
      beforeSchedulerPaddingRight,
    } = this.state;
    const schedulerEl = this.schedulerRef.current;

    Object.assign(schedulerEl.style, beforeSchedulerOverflows, {
      paddingRight: beforeSchedulerPaddingRight,
    });

    this.setState({
      schedulerScroll: {
        x: 0,
        y: 0,
      },
      beforeSchedulerOverflows: null,
    });

    schedulerEl.removeEventListener('scroll', this.lockSchedulerScroll, false);
  };

  lockSchedulerScroll = () => {
    const {
      schedulerScroll: { x, y },
    } = this.state;
    const schedulerEl = this.schedulerRef.current;

    const diff = {
      x: schedulerEl.scrollLeft - x,
      y: schedulerEl.scrollTop - y,
    };

    if (diff.x === 0 && diff.y === 0) {
      return;
    }

    schedulerEl.scrollLeft = x;
    schedulerEl.scrollTop = y;
  };

  handleOutsideClick = e => {
    if (this.schedulerRef.current.contains(e.target)) {
      return;
    }

    const {
      showEditModal,
      showRecurrencerModal,
      showMultiRecurrencerModal,
    } = this.state;

    if (showEditModal) {
      return this.handleCloseEditModal();
    }

    if (showRecurrencerModal) {
      return this.handleCloseRecurrencerModal();
    }

    if (showMultiRecurrencerModal) {
      return this.handleCloseMultiRecurrencerModal();
    }
  };

  openEditModal = valueToEdit => {
    this.setState(
      {
        showEditModal: true,
        valueToEdit,
        editInitialValues: {
          begin: dateFns.format(valueToEdit.begin, 'HH:mm'),
          end: dateFns.format(valueToEdit.end, 'HH:mm'),
        },
      },
      () => {
        document.addEventListener('click', this.handleOutsideClick, true);
      }
    );
  };

  openRecurrencerModal = e => {
    if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // execute this after close the current modal
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick, true);

      const { valueToEdit } = this.state;

      this.setState({
        showEditModal: false,
        valueToEdit: null,
        showRecurrencerModal: true,
        valueToDuplicate: valueToEdit,
      });
    });
  };

  openMultiRecurrencerModal = e => {
    if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    document.addEventListener('click', this.handleOutsideClick, true);

    this.setState({
      showEditModal: false,
      valueToEdit: null,
      showRecurrencerModal: false,
      valueToDuplicate: null,
      showMultiRecurrencerModal: true,
    });
  };

  handleCloseEditModal = () => {
    document.removeEventListener('click', this.handleOutsideClick, true);

    this.stopLockScroll();

    this.setState({
      showEditModal: false,
      valueToEdit: null,
    });
  };

  handleCloseRecurrencerModal = () => {
    clearTimeout(this.recurrencerCloserTimeoutId);

    document.removeEventListener('click', this.handleOutsideClick, true);

    this.stopLockScroll();

    this.setState({
      showRecurrencerModal: false,
      valueToDuplicate: null,
    });
  };

  handleCloseMultiRecurrencerModal = () => {
    clearTimeout(this.multiRecurrencerCloserTimeoutId);

    document.removeEventListener('click', this.handleOutsideClick, true);

    this.stopLockScroll();

    this.setState({
      showMultiRecurrencerModal: false,
    });
  };

  handleEditSubmit = value => {
    const { valueToEdit } = this.state;
    const selectorEl = this.selectorRef.current;

    selectorEl.updateValue(valueToEdit, value);

    this.handleCloseEditModal();
  };

  extractTimings = frequence => {
    const { value, activeWeek, weekStartsOn } = this.props;

    const start = frequence === 'monthly'
      ? dateFns.startOfMonth(activeWeek)
      : dateFns.startOfWeek(activeWeek, { weekStartsOn });
    const end = frequence === 'monthly'
      ? dateFns.endOfMonth(activeWeek)
      : dateFns.endOfWeek(activeWeek, { weekStartsOn });

    const startTime = start.getTime();
    const endTime = end.getTime();

    return value.filter(timing => {
      const beginTime = timing.begin.getTime();

      return beginTime >= startTime && beginTime <= endTime;
    });
  };

  recurrencerValuesToTimings = values => {
    const { weekStartsOn } = this.props;
    const { valueToDuplicate } = this.state;

    return duplicateTiming(valueToDuplicate, {
      weekStartsOn,
      ...values,
    }).filter(v => v.begin.getTime() !== valueToDuplicate.begin.getTime());
  };

  multiRecurrencerValuesToTimings = values => {
    const { weekStartsOn } = this.props;
    const valuesToDuplicate = this.extractTimings(values.frequence);

    return valuesToDuplicate.map(valueToDuplicate => duplicateTiming(valueToDuplicate, {
      weekStartsOn,
      ...values,
    }).filter(v => v.begin.getTime() !== valueToDuplicate.begin.getTime()));
  };

  handleRecurrencerSubmit = values => {
    const timings = this.recurrencerValuesToTimings(values);
    const selectorEl = this.selectorRef.current;

    try {
      selectorEl.addValues(timings, values.forceTimingsCreation);
    } catch (e) {
      return { [FORM_ERROR]: e };
    }

    this.recurrencerCloserTimeoutId = setTimeout(
      this.handleCloseRecurrencerModal,
      1600
    );
  };

  handleMultiRecurrencerSubmit = values => {
    const timings = this.multiRecurrencerValuesToTimings(values).flat();
    const selectorEl = this.selectorRef.current;

    try {
      selectorEl.addValues(timings, values.forceTimingsCreation);
    } catch (e) {
      return { [FORM_ERROR]: e };
    }

    this.multiRecurrencerCloserTimeoutId = setTimeout(
      this.handleCloseMultiRecurrencerModal,
      1600
    );
  };

  onRecurrencerDayPickerHide = () => {
    const elem = this.recurrencerModalRef.current.node.getElementsByClassName(
      'ReactModal__Content'
    )[0];

    if (elem.scrollTop + elem.clientHeight === elem.scrollHeight) {
      elem.scrollTop -= 1;
      elem.scrollTop += 1;
    }
  };

  onMultiRecurrencerDayPickerHide = () => {
    const elem = this.multiRecurrencerModalRef.current.node.getElementsByClassName(
      'ReactModal__Content'
    )[0];

    if (elem.scrollTop + elem.clientHeight === elem.scrollHeight) {
      elem.scrollTop -= 1;
      elem.scrollTop += 1;
    }
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
      allowedTimings,
      editOnClick,
      breakpoint,
      classNamePrefix,
      intl,
    } = this.props;
    const {
      modalStyle,
      showEditModal,
      showRecurrencerModal,
      showMultiRecurrencerModal,
      schedulerScroll,
      editInitialValues,
      valueToEdit,
      valueToDuplicate,
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
              editOnClick={editOnClick}
              cellHeight={cellHeight}
              step={step}
              selectableStep={step / 2}
              timingLimit={timingLimit}
              allowedTimings={allowedTimings}
              classNamePrefix={classNamePrefix}
              breakpoint={breakpoint}
              timingFormat={timingFormat}
            />
          </div>
        </div>

        <div
          className={`${classNamePrefix}multi-recurrencer-button`}
          role="button"
          tabIndex={0}
          onClick={this.openMultiRecurrencerModal}
          onKeyPress={this.openMultiRecurrencerModal}
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
          {showEditModal ? (
            <EditForm
              initialValues={editInitialValues}
              onSubmit={this.handleEditSubmit}
              classNamePrefix={classNamePrefix}
              openRecurrencerModal={this.openRecurrencerModal}
              valueToEdit={valueToEdit}
              closeModal={this.handleCloseEditModal}
            />
          ) : null}
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
              closeModal={this.handleCloseRecurrencerModal}
              onDayPickerHide={this.onRecurrencerDayPickerHide}
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
              closeModal={this.handleCloseMultiRecurrencerModal}
              onDayPickerHide={this.onMultiRecurrencerDayPickerHide}
            />
          ) : null}
        </ReactModal>
      </>
    );
  }
}

export default injectIntl(Scheduler, { forwardRef: true });
