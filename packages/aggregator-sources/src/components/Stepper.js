import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
  useLayoutEffect
} from 'react';
import classNames from 'classnames';

const defaultBgColor = 'rgba(0, 0, 0, 0)';

function Step({
  step, onSelect, className: _className, style
}) {
  const onSelectStep = useCallback(
    e => {
      if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        return;
      }

      if (step.activable) {
        onSelect(step.key);
      }
    },
    [onSelect, step.activable, step.key]
  );

  const className = useMemo(
    () => classNames('step', _className, {
      active: step.active,
      activable: step.activable,
      passed: step.passed
    }),
    [_className, step.activable, step.active, step.passed]
  );

  if (step.active || !step.activable) {
    return (
      <div className={className} style={style}>
        {step.label}
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
      {step.label}
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

export default function Stepper({ steps = [], onSelect }) {
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
        {steps
          .filter(s => s.display)
          .map(s => (
            <Step key={s.key} step={s} onSelect={onSelect} style={stepStyle} />
          ))}
      </div>
    </div>
  );
}
