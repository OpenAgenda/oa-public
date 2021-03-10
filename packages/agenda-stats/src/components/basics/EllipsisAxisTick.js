import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { usePrevious } from 'react-use';
import { Text } from 'recharts';

export default function EllipsisAxisTick({ maxLines = 2, payload, ...rest }) {
  const [text, setText] = useState(payload.value);
  const previousValue = usePrevious(payload.value);
  const [suffix, setSuffix] = useState('');

  const measureProps = useMemo(
    () => ({
      width: rest.width - 3,
      style: rest.style,
      scaleToFit: rest.scaleToFit,
      children: rest.children,
    }),
    [rest.children, rest.scaleToFit, rest.style, rest.width]
  );

  const textRef = useRef(null);
  const measure = useCallback(() => {
    if (!textRef.current) {
      return;
    }

    let { wordsByLines } = textRef.current.state;
    let biggestLine = wordsByLines.reduce((a, b) => (a.width > b.width ? a : b));
    let tempText = text;
    const tempSuffix = wordsByLines.length > maxLines || biggestLine.width > measureProps.width
      ? '…'
      : '';

    while (
      wordsByLines.length > maxLines
      || biggestLine.width > measureProps.width
    ) {
      tempText = tempText.slice(0, -1);
      wordsByLines = textRef.current.getWordsByLines(
        {
          ...measureProps,
          children: tempText + tempSuffix,
        },
        true
      );
      biggestLine = wordsByLines.reduce((a, b) => (a.width > b.width ? a : b));
    }

    if (tempText !== text) {
      setText(tempText);
      setSuffix(tempSuffix);
    }
  }, [text, maxLines, measureProps]);

  useEffect(() => {
    if (payload.value !== previousValue) {
      setText(payload.value);
      setSuffix('');
    }
  }, [previousValue, payload.value]);

  useEffect(() => {
    // Need to measure text after the re-render
    setImmediate(() => measure());
  }, [measure]);

  return (
    <g>
      <Text {...rest} ref={textRef}>
        {text + suffix}
      </Text>
      <title>{payload.value}</title>
    </g>
  );
}
