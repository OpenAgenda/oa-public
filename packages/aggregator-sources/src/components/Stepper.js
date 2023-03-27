import { useCallback, useState, useMemo, useRef } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';
import classNames from 'classnames';
import { useMemoOne } from '@openagenda/react-shared';

const defaultBgColor = 'rgba(0, 0, 0, 0)';

function getStepPropertyValue(step, propName, ...args) {
  const property = step[propName];

  if (typeof property === 'function') {
    return property(step, ...args);
  }

  return property;
}

function Step({
  step,
  onSelect,
  className: _className,
  style,
  index,
  steps,
  additionals,
  confirmation,
}) {
  const activable = useMemoOne(
    () => getStepPropertyValue(step, 'activable', index, steps, ...additionals),
    [step, index, steps, additionals],
  );
  const active = useMemoOne(
    () => getStepPropertyValue(step, 'active', index, steps, ...additionals),
    [step, index, steps, additionals],
  );
  const passed = useMemoOne(
    () => getStepPropertyValue(step, 'passed', index, steps, ...additionals),
    [step, index, steps, additionals],
  );
  const label = useMemoOne(
    () => getStepPropertyValue(step, 'label', index, steps, ...additionals),
    [step, index, steps, additionals],
  );

  const onSelectStep = useCallback(
    e => {
      if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        return;
      }

      if (activable) {
        onSelect(step.key);
      }
    },
    [onSelect, activable, step.key],
  );

  const className = useMemo(
    () =>
      classNames('step', _className, {
        active,
        activable,
        passed,
        confirmation,
      }),
    [_className, activable, active, passed, confirmation],
  );

  if (active || !activable) {
    return (
      <div className={className} style={style}>
        {label}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelectStep}
      onKeyPress={onSelectStep}
      className={className}
      style={style}
    >
      {label}
    </div>
  );
}

function getClosestBgColor(elem) {
  if (typeof window === 'undefined' || !elem) {
    return null;
  }

  const style = window.getComputedStyle(elem, null);

  if (style.backgroundColor !== defaultBgColor) {
    return style.backgroundColor;
  }

  return getClosestBgColor(elem.parentElement);
}

export default function Stepper({ steps = [], onSelect, additionals }) {
  const containerRef = useRef(null);
  const [bgColor, setBbColor] = useState(defaultBgColor);
  const stepStyle = useMemo(() => ({ backgroundColor: bgColor }), [bgColor]);

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      const closestBgColor = getClosestBgColor(containerRef.current);

      if (closestBgColor !== bgColor) {
        setBbColor(closestBgColor);
      }
    }
  }, [bgColor]);

  return (
    <div className="stepper-container margin-bottom-sm" ref={containerRef}>
      <div id="stepper" className="stepper">
        {steps.map((s, index) =>
          (s.display ? (
            <Step
              key={s.key}
              step={s}
              onSelect={onSelect}
              style={stepStyle}
              index={index}
              steps={steps}
              additionals={additionals}
              confirmation={s.confirmation}
            />
          ) : null))}
      </div>
    </div>
  );
}
