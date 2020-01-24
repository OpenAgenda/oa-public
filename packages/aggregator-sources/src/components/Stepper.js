import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
  useLayoutEffect
} from 'react';
import classNames from 'classnames';
import { useMemoOne } from '@openagenda/react-shared/dist/hooks/useMemoOne';

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
  additionals
}) {
  const activable = useMemoOne(
    () => getStepPropertyValue(step, 'activable', index, steps, ...additionals),
    [step, index, steps, additionals]
  );
  const active = useMemoOne(
    () => getStepPropertyValue(step, 'active', index, steps, ...additionals),
    [step, index, steps, additionals]
  );
  const passed = useMemoOne(
    () => getStepPropertyValue(step, 'passed', index, steps, ...additionals),
    [step, index, steps, additionals]
  );
  const label = useMemoOne(
    () => getStepPropertyValue(step, 'label', index, steps, ...additionals),
    [step, index, steps, additionals]
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
    [onSelect, activable, step.key]
  );

  const className = useMemo(
    () => classNames('step', _className, {
      active,
      activable,
      passed
    }),
    [_className, activable, active, passed]
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

  useLayoutEffect(() => {
    if (containerRef.current) {
      const closestBgColor = getClosestBgColor(containerRef.current);

      if (closestBgColor !== bgColor) {
        setBbColor(closestBgColor);
      }
    }
  }, [bgColor]);

  return (
    <div className="stepper-container" ref={containerRef}>
      <div id="stepper" className="stepper">
        {steps.map((s, index) => (s.display ? (
          <Step
            key={s.key}
            step={s}
            onSelect={onSelect}
            style={stepStyle}
            index={index}
            steps={steps}
            additionals={additionals}
          />
        ) : null))}
      </div>
    </div>
  );
}
