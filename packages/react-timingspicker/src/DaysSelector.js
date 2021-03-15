import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import * as dateFns from 'date-fns';

import isDisabledTiming from './utils/isDisabledTiming';
import normalizeEndOfTiming from './utils/normalizeEndOfTiming';
import secondsToHeight from './utils/secondsToHeight';
import splitSelection from './utils/splitSelection';
import stepPositionToSelection from './utils/stepPositionToSelection';
import valueToStepPosition from './utils/valueToStepPosition';
import timingUtils from './utils/timing';

const ONE_DAY = 60 * 60 * 24;

function formatTimingValue(timingFormat, begin, end, breakpoint) {
  const formatTime = time => dateFns.format(time, timingFormat);

  if (['sm', 'xs'].includes(breakpoint)) {
    return (
      <>
        {formatTime(begin)}
        <br />
        {formatTime(end)}
      </>
    );
  }

  return (
    <>
      {formatTime(begin)} - {formatTime(end)}
    </>
  );
}

class DaysSelector extends Component {
  static defaultProps = {
    step: 60 * 60, // seconds in a grid visible vertical increment
    selectableStep: 30 * 60, // seconds in a grid vertical selectable increment
    cellHeight: 40, // in pixels
    timingLimit: ONE_DAY, // maximum allow duration of a timing
    value: null,
    onChange: null,
  };

  bodyRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      mousePosition: null,
      selectionStart: null,
      selection: null,

      cursorStartStepPosition: null,
      valueToMove: null,
      selectionMoving: null,

      resizePositionStart: null,
      valueToResize: null,
      selectionResizing: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const {
      value, activeWeek, weekStartsOn, allowedTimings
    } = props;

    const derivedState = {};

    if (
      allowedTimings !== state.allowedTimings
      || activeWeek !== state.activeWeek
    ) {
      derivedState.allowedTimings = allowedTimings;
      derivedState.activeWeek = activeWeek;

      if (allowedTimings && allowedTimings.length) {
        const weekStart = dateFns.startOfWeek(activeWeek, { weekStartsOn });
        const weekEnd = dateFns.endOfWeek(activeWeek, { weekStartsOn });

        derivedState.reducedAllowedTimings = allowedTimings
          .map(timing => ({
            begin:
              typeof timing.begin === 'string'
                ? dateFns.parseISO(timing.begin)
                : timing.begin,
            end:
              typeof timing.end === 'string'
                ? dateFns.parseISO(timing.end)
                : timing.end,
          }))
          .sort((a, b) => dateFns.compareAsc(a.begin, b.begin))
          .reduce((accu, allowedTiming) => {
            if (
              accu.length
              && !dateFns.isAfter(
                allowedTiming.begin,
                accu[accu.length - 1].end
              )
              && !dateFns.isBefore(
                allowedTiming.begin,
                accu[accu.length - 1].begin
              )
            ) {
              if (
                dateFns.isAfter(allowedTiming.end, accu[accu.length - 1].end)
              ) {
                accu[accu.length - 1].end = allowedTiming.end;
              }

              return accu;
            }

            accu.push({
              begin: allowedTiming.begin,
              end: allowedTiming.end,
            });

            return accu;
          }, []);

        derivedState.disallowedTimings = derivedState.reducedAllowedTimings.reduce(
          (accu, allowedTiming, i, array) => {
            if (!accu.length) {
              // begin from week start
              if (dateFns.isBefore(allowedTiming.begin, weekStart)) {
                accu.push({
                  begin: allowedTiming.begin,
                  end: weekStart,
                });
              } else {
                accu.push({
                  begin: weekStart,
                  end: allowedTiming.begin,
                });
              }
            } else if (dateFns.isAfter(allowedTiming.begin, array[i - 1].end)) {
              // next begin is after previous end
              accu.push({
                begin: array[i - 1].end,
                end: allowedTiming.begin,
              });
            }

            if (
              i + 1 === array.length
              && dateFns.isBefore(allowedTiming.end, weekEnd)
            ) {
              // end to week end
              accu.push({
                begin: allowedTiming.end,
                end: weekEnd,
              });
            }

            return accu;
          },
          []
        );
      }
    }

    if (value !== state.value) {
      derivedState.value = value || state.value;
    }

    if (Object.keys(derivedState).length) {
      return derivedState;
    }

    return null;
  }

  updateValue = (valueToUpdate, submittedValue) => {
    const { onChange } = this.props;
    const { value, reducedAllowedTimings } = this.state;

    const filteredValue = value.filter(
      v => !(
        dateFns.isEqual(v.begin, valueToUpdate.begin)
          && dateFns.isEqual(v.end, valueToUpdate.end)
      )
    );
    const isDisabled = isDisabledTiming(
      submittedValue,
      filteredValue,
      reducedAllowedTimings
    );

    if (!isDisabled) {
      const newValue = [...filteredValue, submittedValue];

      if (typeof onChange === 'function') {
        onChange(newValue);
      }
    }
  };

  addValues = (values, force) => {
    const { onChange } = this.props;
    const { value, reducedAllowedTimings } = this.state;

    let valuesToAdd;

    if (!force) {
      const disabledTimings = values.filter(item => isDisabledTiming(item, value, reducedAllowedTimings));

      if (disabledTimings.length) {
        const error = new Error('someDisabledValues');

        error.disabledTimings = disabledTimings;

        throw error;
      }

      valuesToAdd = values;
    } else {
      valuesToAdd = values.filter(
        item => !isDisabledTiming(item, value, reducedAllowedTimings)
      );
    }

    const newValue = [...value, ...valuesToAdd];

    this.setState({
      value: newValue,
    });

    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  eventToStepPosition = e => {
    const { selectableStep, step, cellHeight } = this.props;
    const body = this.bodyRef.current;
    const bodyPosition = body.getBoundingClientRect();
    const maxTop = ONE_DAY / selectableStep;
    let left = Math.floor(
      (e.clientX - bodyPosition.left) / (body.clientWidth / 7)
    );
    let top = (e.clientY - bodyPosition.top) / ((cellHeight / step) * selectableStep);

    if (left < 0) {
      left = 0;
    }

    if (left > 6) {
      left = 6;
    }

    if (top < 0) {
      top = 0;
    }

    if (top > maxTop) {
      top = maxTop;
    }

    return { left, top };
  };

  onSelectionMouseDown = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const { selectableStep } = this.props;
    const stepPosition = this.eventToStepPosition(e);
    const { end } = stepPositionToSelection(this.props, stepPosition);

    const selectionStart = dateFns.subSeconds(end, selectableStep);
    const selection = [
      {
        begin: selectionStart,
        end: normalizeEndOfTiming(end),
      },
    ];

    this.setState(
      {
        selectionStart,
        selection,
        mousePosition: {
          clientX: e.clientX,
          clientY: e.clientY,
        },
      },
      () => {
        this.autoScrollInterval = setInterval(this.autoScroll, 1000 / 60);
      }
    );

    window.addEventListener('pointermove', this.onSelectionMouseMove, false);
    window.addEventListener('pointerup', this.onSelectionMouseUp, {
      once: true,
      capture: false,
    });
  };

  onSelectionMouseMove = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const { selectionStart } = this.state;

    if (!selectionStart) {
      return;
    }

    const stepPosition = this.eventToStepPosition(e);
    const { begin, end } = stepPositionToSelection(
      this.props,
      stepPosition,
      selectionStart
    );

    const selection = splitSelection(this.props, {
      begin,
      end: normalizeEndOfTiming(end),
    });

    this.setState({
      selection,
      mousePosition: {
        clientX: e.clientX,
        clientY: e.clientY,
      },
    });
  };

  onSelectionMouseUp = e => {
    window.removeEventListener('pointermove', this.onSelectionMouseMove);

    const {
      onSelect,
      onChange,
      editOnClick,
      openEditModal,
      selectableStep,
    } = this.props;
    const { value, selectionStart, reducedAllowedTimings } = this.state;

    if (!selectionStart) {
      return;
    }

    const stepPosition = this.eventToStepPosition(e);
    const { begin, end } = stepPositionToSelection(
      this.props,
      stepPosition,
      selectionStart
    );

    const selection = splitSelection(this.props, {
      begin,
      end: normalizeEndOfTiming(end),
    }).filter(item => !isDisabledTiming(item, value, reducedAllowedTimings));

    clearInterval(this.autoScrollInterval);

    this.setState({
      selectionStart: null,
      selection: null,
      mousePosition: null,
    });

    if (selection.length) {
      const newValue = [...(value || []), ...selection];

      this.setState({
        value: newValue,
      });

      if (typeof onSelect === 'function') {
        onSelect(selection);
      }

      if (typeof onChange === 'function') {
        onChange(newValue);
      }
    }

    if (
      editOnClick
      && selection.length === 1
      && dateFns.differenceInMilliseconds(end, begin) / 1000 <= selectableStep
    ) {
      setTimeout(() => openEditModal(selection[0]));
    }
  };

  onDragMouseDown = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const { value } = this.state;
    const stepPosition = this.eventToStepPosition(e);
    const { end } = stepPositionToSelection(this.props, stepPosition, 0, true);

    const usedEnd = normalizeEndOfTiming(end);
    const valueToMove = value.find(
      v => dateFns.isAfter(usedEnd, v.begin) && !dateFns.isAfter(usedEnd, v.end)
    );

    if (!valueToMove) {
      return;
    }

    this.setState(
      {
        cursorStartStepPosition: stepPosition,
        valueToMove,
        selectionMoving: valueToMove,
        firstMousePosition: {
          clientX: e.clientX,
          clientY: e.clientY,
        },
        mousePosition: {
          clientX: e.clientX,
          clientY: e.clientY,
        },
      },
      () => {
        this.autoScrollInterval = setInterval(this.autoScroll, 1000 / 60);
      }
    );

    window.addEventListener('pointermove', this.onDragMouseMove, false);
    window.addEventListener('pointerup', this.onDragMouseUp, {
      once: true,
      capture: false,
    });
  };

  /**
   * for when a timing is dragged around
   */
  onDragMouseMove = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const { selectableStep } = this.props;
    const { cursorStartStepPosition, valueToMove } = this.state;

    if (!cursorStartStepPosition) {
      return;
    }

    const cursorCurrentStepPosition = this.eventToStepPosition(e);

    const diff = {
      top: Math.round(
        cursorCurrentStepPosition.top - cursorStartStepPosition.top
      ),
      left: Math.round(
        cursorCurrentStepPosition.left - cursorStartStepPosition.left
      ),
    };
    const valueStepPosition = valueToStepPosition(this.props, valueToMove);

    const newValuePosition = {
      top: valueStepPosition.begin.top + diff.top,
      left: valueStepPosition.begin.left + diff.left,
    };

    const newPositionStart = dateFns.addDays(
      dateFns.addSeconds(
        valueToMove.begin,
        (valueStepPosition.steps + diff.top - 1) * selectableStep
      ),
      diff.left
    );

    const selectionMoving = stepPositionToSelection(
      this.props,
      newValuePosition,
      newPositionStart,
      true
    );

    selectionMoving.end = normalizeEndOfTiming(selectionMoving.end);

    this.setState({
      selectionMoving,
      mousePosition: {
        clientX: e.clientX,
        clientY: e.clientY,
      },
    });
  };

  onDragMouseUp = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    window.removeEventListener('pointermove', this.onDragMouseMove);

    const {
      onMove, onChange, openEditModal, selectableStep
    } = this.props;
    const {
      firstMousePosition,
      value,
      cursorStartStepPosition,
      valueToMove,
      reducedAllowedTimings,
    } = this.state;

    clearInterval(this.autoScrollInterval);

    this.setState({
      cursorStartStepPosition: null,
      valueToMove: null,
      selectionMoving: null,
      firstMousePosition: null,
      mousePosition: null,
    });

    if (!cursorStartStepPosition) {
      return;
    }

    // If it's a click
    if (
      firstMousePosition.clientX === e.clientX
      && firstMousePosition.clientY === e.clientY
    ) {
      return setTimeout(() => openEditModal(valueToMove));
    }

    const stepPosition = this.eventToStepPosition(e);
    const diff = {
      top: Math.round(stepPosition.top - cursorStartStepPosition.top),
      left: Math.round(stepPosition.left - cursorStartStepPosition.left),
    };
    const valueStepPosition = valueToStepPosition(this.props, valueToMove);
    const newValuePosition = {
      top: valueStepPosition.begin.top + diff.top,
      left: valueStepPosition.begin.left + diff.left,
    };
    const newPositionStart = dateFns.addDays(
      dateFns.addSeconds(
        valueToMove.begin,
        (valueStepPosition.steps + diff.top - 1) * selectableStep
      ),
      diff.left
    );

    const selectionMoving = stepPositionToSelection(
      this.props,
      newValuePosition,
      newPositionStart,
      true
    );

    selectionMoving.end = normalizeEndOfTiming(selectionMoving.end);

    const filteredValue = value.filter(
      v => !(v.begin === valueToMove.begin && v.end === valueToMove.end)
    );
    const isDisabled = isDisabledTiming(
      selectionMoving,
      filteredValue,
      reducedAllowedTimings
    );

    if (
      !isDisabled
      && (!dateFns.isEqual(selectionMoving.begin, valueToMove.begin)
        || !dateFns.isEqual(selectionMoving.end, valueToMove.end))
    ) {
      const newValue = [...filteredValue, selectionMoving];

      this.setState({
        value: newValue,
      });

      if (typeof onMove === 'function') {
        onMove(selectionMoving, valueToMove);
      }

      if (typeof onChange === 'function') {
        onChange(newValue);
      }
    }
  };

  onResizeMouseDown = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    e.stopPropagation();

    const { value } = this.state;
    const stepPosition = this.eventToStepPosition(e);
    const { end } = stepPositionToSelection(this.props, stepPosition, 0, true);

    const usedEnd = normalizeEndOfTiming(end);
    const valueToResize = value.find(
      v => dateFns.isAfter(usedEnd, v.begin) && !dateFns.isAfter(usedEnd, v.end)
    );

    if (!valueToResize) {
      return;
    }

    this.setState(
      {
        resizePositionStart: stepPosition,
        valueToResize,
        selectionResizing: valueToResize,
        mousePosition: {
          clientX: e.clientX,
          clientY: e.clientY,
        },
      },
      () => {
        this.autoScrollInterval = setInterval(this.autoScroll, 1000 / 60);
      }
    );

    window.addEventListener('pointermove', this.onResizeMouseMove, false);
    window.addEventListener('pointerup', this.onResizeMouseUp, {
      once: true,
      capture: false,
    });
  };

  onResizeMouseMove = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    e.stopPropagation();

    const { selectableStep, timingLimit } = this.props;
    const { resizePositionStart, valueToResize } = this.state;

    if (!resizePositionStart) {
      return;
    }

    const stepPosition = this.eventToStepPosition(e);
    const diff = {
      top: Math.round(stepPosition.top - resizePositionStart.top),
      left: Math.round(stepPosition.left - resizePositionStart.left),
    };
    const valueStepPosition = valueToStepPosition(this.props, valueToResize);
    const newPositionStart = dateFns.addDays(
      dateFns.addSeconds(
        valueToResize.begin,
        (valueStepPosition.steps + diff.top - 1) * selectableStep
      ),
      diff.left
    );

    const selection = stepPositionToSelection(
      this.props,
      {
        top: dateFns.isBefore(
          dateFns.addSeconds(newPositionStart, timingLimit),
          valueToResize.begin
        )
          ? valueStepPosition.begin.top + 1
          : valueStepPosition.begin.top,
        left: valueStepPosition.begin.left,
      },
      newPositionStart,
      true
    );

    const selectionResizing = splitSelection(this.props, selection);

    this.setState({
      selectionResizing,
      mousePosition: {
        clientX: e.clientX,
        clientY: e.clientY,
      },
    });
  };

  onResizeMouseUp = e => {
    window.removeEventListener('pointermove', this.onResizeMouseMove);

    const {
      onResize, onChange, selectableStep, timingLimit
    } = this.props;
    const {
      value,
      resizePositionStart,
      valueToResize,
      reducedAllowedTimings,
    } = this.state;

    if (!resizePositionStart) {
      return;
    }

    const stepPosition = this.eventToStepPosition(e);
    const diff = {
      top: Math.round(stepPosition.top - resizePositionStart.top),
      left: Math.round(stepPosition.left - resizePositionStart.left),
    };
    const valueStepPosition = valueToStepPosition(this.props, valueToResize);
    const newPositionStart = dateFns.addDays(
      dateFns.addSeconds(
        valueToResize.begin,
        (valueStepPosition.steps + diff.top - 1) * selectableStep
      ),
      diff.left
    );
    const selection = splitSelection(
      this.props,
      stepPositionToSelection(
        this.props,
        {
          top: dateFns.isBefore(
            dateFns.addSeconds(newPositionStart, timingLimit),
            valueToResize.begin
          )
            ? valueStepPosition.begin.top + 1
            : valueStepPosition.begin.top,
          left: valueStepPosition.begin.left,
        },
        newPositionStart,
        true
      )
    );
    const filteredValue = value.filter(
      v => !(v.begin === valueToResize.begin && v.end === valueToResize.end)
    );
    const isDisabled = selection.some(item => isDisabledTiming(item, filteredValue, reducedAllowedTimings));

    clearInterval(this.autoScrollInterval);

    this.setState({
      resizePositionStart: null,
      valueToResize: null,
      selectionResizing: null,
      mousePosition: null,
    });

    if (
      !isDisabled
      && (selection.length > 1
        || !dateFns.isEqual(selection[0].begin, valueToResize.begin)
        || !dateFns.isEqual(selection[0].end, valueToResize.end))
    ) {
      const newValue = [...filteredValue, ...selection];

      this.setState({
        value: newValue,
      });

      if (typeof onResize === 'function') {
        onResize(selection, valueToResize);
      }

      if (typeof onChange === 'function') {
        onChange(newValue);
      }
    }
  };

  onRemoveMouseDown = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    e.stopPropagation();
  };

  onRemoveClick = e => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const { onRemove, onChange } = this.props;
    const { value } = this.state;
    const stepPosition = this.eventToStepPosition(e);
    const { end } = stepPositionToSelection(this.props, stepPosition, 0, true);

    const usedEnd = normalizeEndOfTiming(end);
    const valueToRemove = value.find(
      v => dateFns.isAfter(usedEnd, v.begin) && !dateFns.isAfter(usedEnd, v.end)
    );

    if (!valueToRemove) {
      return;
    }

    const newValue = value.filter(
      v => !(v.begin === valueToRemove.begin && v.end === valueToRemove.end)
    );

    this.setState({
      value: newValue,
    });

    if (typeof onRemove === 'function') {
      onRemove(valueToRemove);
    }

    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  autoScroll = () => {
    const { mousePosition } = this.state;
    const body = this.bodyRef.current;
    const tableElem = body.parentElement.parentElement;
    const bodyPosition = body.getBoundingClientRect();
    const topOut = mousePosition.clientY - bodyPosition.top - tableElem.scrollTop;
    const bottomOut = bodyPosition.top
      + tableElem.offsetHeight
      - (mousePosition.clientY - tableElem.scrollTop);

    if (topOut < 0) {
      tableElem.scrollBy(0, Math.floor(topOut / 15));
    }

    if (bottomOut < 0) {
      tableElem.scrollBy(0, Math.ceil(Math.abs(bottomOut) / 15));
    }
  };

  addDisabledProps = (timings, disabled, enabled) => {
    if ((!disabled || !disabled.length) && (!enabled || !enabled.length)) {
      return timings;
    }

    return timings.reduce(
      (result, item) => [
        ...result,
        { ...item, disabled: isDisabledTiming(item, disabled, enabled) },
      ],
      []
    );
  };

  renderDays = () => {
    const {
      activeWeek,
      weekStartsOn,
      step,
      cellHeight,
      classNamePrefix,
    } = this.props;
    const startOfActiveWeek = dateFns.startOfWeek(activeWeek, { weekStartsOn });
    const columns = [];
    let actual = startOfActiveWeek;

    for (let i = 0; i < 7; i++) {
      const cells = [];

      for (let j = 0; j < ONE_DAY; j += step) {
        cells.push(
          <div
            key={`day-${j}`}
            className={`${classNamePrefix}cell`}
            touch-action="none"
            onPointerDown={this.onSelectionMouseDown}
            style={{ height: `${cellHeight}px` }}
          />
        );

        actual = dateFns.addSeconds(actual, step);
      }

      columns.push(
        <div className={`${classNamePrefix}column`} key={`column-${i}`}>
          {cells}
        </div>
      );
    }

    return columns;
  };

  renderTimings = ({
    value: rawValue,
    disabled: disabledTimings,
    Component: TimingComponent,
  }) => {
    if (!rawValue) {
      return null;
    }

    const value = Array.isArray(rawValue) ? rawValue : [].concat(rawValue);

    if (!value.length) {
      return null;
    }

    const { activeWeek, weekStartsOn } = this.props;
    const { reducedAllowedTimings } = this.state;
    const timings = this.addDisabledProps(
      value,
      disabledTimings,
      reducedAllowedTimings
    );
    const startOfActiveWeek = dateFns.startOfWeek(activeWeek, { weekStartsOn });
    const endOfActiveWeek = dateFns.endOfWeek(activeWeek, { weekStartsOn });
    const maxTop = secondsToHeight(this.props, ONE_DAY);
    const selectionElems = [];

    for (let i = 0; i < timings.length; i++) {
      const { begin, end, disabled } = timings[i];
      const beginStartOfDay = dateFns.startOfDay(begin);
      const leftOffset = dateFns.differenceInDays(
        beginStartOfDay,
        startOfActiveWeek
      );
      const numberOfParts = dateFns.differenceInDays(end, beginStartOfDay);

      let actual = begin;

      const top = timingUtils.top(this.props, timings[i]);

      for (let j = 0; j <= numberOfParts; j++) {
        if (
          dateFns.isBefore(actual, startOfActiveWeek)
          || dateFns.isAfter(actual, endOfActiveWeek)
        ) {
          actual = dateFns.addDays(actual, 1);
          continue;
        }

        const beginOfActualDay = dateFns.startOfDay(dateFns.addDays(begin, j));
        const endOfActualDay = dateFns.endOfDay(actual);
        const timingBegin = j === 0 ? begin : beginOfActualDay;
        const timingEnd = dateFns.isBefore(end, endOfActualDay)
          ? end
          : endOfActualDay;
        const left = (100 / 7) * (leftOffset + j); // %
        const height = Math.round(
          secondsToHeight(
            this.props,
            dateFns.differenceInMilliseconds(timingEnd, timingBegin) / 1000
          )
        ); // px

        selectionElems.push(
          TimingComponent({
            key: `${i}.${j}`,
            actual: timingBegin,
            first: j === 0,
            last: j === numberOfParts,
            begin,
            end,
            top: j === 0 ? top : 0,
            left,
            height: top + height === maxTop ? height - 1 : height,
            disabled,
          })
        );
        actual = dateFns.addDays(actual, 1);
      }
    }

    return selectionElems;
  };

  render() {
    const {
      classNamePrefix,
      breakpoint,
      cellHeight,
      step,
      selectableStep,
      timingFormat,
    } = this.props;
    const {
      disallowedTimings,
      value,
      selection,
      valueToMove,
      selectionMoving,
      valueToResize,
      selectionResizing,
    } = this.state;

    return (
      <>
        <div
          ref={this.bodyRef}
          className={classNames(`${classNamePrefix}body`, {
            [`${classNamePrefix}timing-moving`]: valueToMove,
            [`${classNamePrefix}timing-resizing`]: valueToResize,
          })}
        >
          {this.renderDays()}

          {this.renderTimings({
            value: disallowedTimings,
            Component: ({
              key, top, left, height
            }) => (
              <div
                key={`disallowed-${key}`}
                className={`${classNamePrefix}disallowed-timing`}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}%`,
                  width: `${100 / 7}%`,
                  height: `${height}px`,
                }}
              />
            ),
          })}

          {this.renderTimings({
            value: value || null,
            Component: ({
              key,
              begin,
              end,
              top,
              left,
              height,
              first,
              last,
            }) => (
              <div
                key={`value-${key}`}
                className={classNames(`${classNamePrefix}value-timing`, {
                  [`${classNamePrefix}value-timing-thin`]:
                    first
                    && last
                    && height <= (cellHeight * selectableStep) / step,
                })}
                role="button"
                touch-action="none"
                onPointerDown={this.onDragMouseDown}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}%`,
                  width: `${100 / 7}%`,
                  height: `${height}px`,
                  display:
                    !(
                      valueToMove
                      && begin === valueToMove.begin
                      && end === valueToMove.end
                    )
                    && !(
                      valueToResize
                      && begin === valueToResize.begin
                      && end === valueToResize.end
                    )
                      ? 'inline-block'
                      : 'none',
                }}
              >
                {first && (
                  <div
                    role="presentation"
                    className={`${classNamePrefix}timing-remove`}
                    touch-action="none"
                    onPointerDown={this.onRemoveMouseDown}
                    onClick={this.onRemoveClick}
                  >
                    ×
                  </div>
                )}
                {first && (
                  <div className={`${classNamePrefix}timing-value`}>
                    {formatTimingValue(timingFormat, begin, end, breakpoint)}
                  </div>
                )}
                {last && (
                  <div
                    className={`${classNamePrefix}timing-resizer`}
                    touch-action="none"
                    onPointerDown={this.onResizeMouseDown}
                  />
                )}
              </div>
            ),
          })}

          {this.renderTimings({
            value: selection,
            disabled: value,
            Component: ({
              key,
              begin,
              end,
              top,
              left,
              height,
              disabled,
              first,
              last,
            }) => (
              <div
                key={`selection-${key}`}
                className={classNames(`${classNamePrefix}selection-timing`, {
                  [`${classNamePrefix}disabled`]: disabled,
                  [`${classNamePrefix}selection-timing-thin`]:
                    first
                    && last
                    && height <= (cellHeight * selectableStep) / step,
                })}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}%`,
                  width: `${100 / 7}%`,
                  height: `${height}px`,
                }}
              >
                {disabled ? null : (
                  <>
                    {first && (
                      <div className={`${classNamePrefix}timing-remove`}>×</div>
                    )}
                    {first && (
                      <div className={`${classNamePrefix}timing-value`}>
                        {formatTimingValue(
                          timingFormat,
                          begin,
                          end,
                          breakpoint
                        )}
                      </div>
                    )}
                    {/* last && <div className={`${classNamePrefix}timing-resizer`} /> */}
                  </>
                )}
              </div>
            ),
          })}

          {this.renderTimings({
            value: selectionMoving,
            disabled: value
              ? value.filter(
                v => !(
                  valueToMove
                      && v.begin === valueToMove.begin
                      && v.end === valueToMove.end
                )
              )
              : value,
            Component: ({
              key,
              begin,
              end,
              top,
              left,
              height,
              disabled,
              first,
              last,
            }) => (
              <div
                key={`selection-moving-${key}`}
                className={classNames(
                  `${classNamePrefix}selection-moving-timing`,
                  {
                    [`${classNamePrefix}disabled`]: disabled,
                    [`${classNamePrefix}selection-moving-timing-thin`]:
                      first
                      && last
                      && height <= (cellHeight * selectableStep) / step,
                  }
                )}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}%`,
                  width: `${100 / 7}%`,
                  height: `${height}px`,
                }}
              >
                {disabled ? null : (
                  <>
                    {first && (
                      <div className={`${classNamePrefix}timing-remove`}>×</div>
                    )}
                    {first && (
                      <div className={`${classNamePrefix}timing-value`}>
                        {formatTimingValue(
                          timingFormat,
                          begin,
                          end,
                          breakpoint
                        )}
                      </div>
                    )}
                    {last && (
                      <div className={`${classNamePrefix}timing-resizer`} />
                    )}
                  </>
                )}
              </div>
            ),
          })}

          {this.renderTimings({
            value: selectionResizing,
            disabled: value
              ? value.filter(
                v => !(
                  valueToResize
                      && v.begin === valueToResize.begin
                      && v.end === valueToResize.end
                )
              )
              : value,
            Component: ({
              key,
              begin,
              end,
              top,
              left,
              height,
              disabled,
              first,
              last,
            }) => (
              <div
                key={`selection-resizing-${key}`}
                className={classNames(
                  `${classNamePrefix}selection-resizing-timing`,
                  {
                    [`${classNamePrefix}disabled`]: disabled,
                    [`${classNamePrefix}selection-resizing-timing-thin`]:
                      first
                      && last
                      && height <= (cellHeight * selectableStep) / step,
                  }
                )}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}%`,
                  width: `${100 / 7}%`,
                  height: `${height}px`,
                }}
              >
                {disabled ? null : (
                  <>
                    {first && (
                      <div className={`${classNamePrefix}timing-remove`}>×</div>
                    )}
                    {first && (
                      <div className={`${classNamePrefix}timing-value`}>
                        {formatTimingValue(
                          timingFormat,
                          begin,
                          end,
                          breakpoint
                        )}
                      </div>
                    )}
                    {last && (
                      <div className={`${classNamePrefix}timing-resizer`} />
                    )}
                  </>
                )}
              </div>
            ),
          })}
        </div>
      </>
    );
  }
}

export default injectIntl(DaysSelector, { forwardRef: true });
