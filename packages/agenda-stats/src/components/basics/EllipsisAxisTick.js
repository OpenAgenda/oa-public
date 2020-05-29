import React, { useCallback, useState, useEffect } from 'react';
import { Text } from 'recharts';

export default function EllipsisAxisTick({ maxLines = 3, payload, ...rest }) {
  const [text, setText] = useState(payload.value);
  const [suffix, setSuffix] = useState('');

  useEffect(() => {
    if (text !== payload.value) {
      setText(payload.value);
    }
  }, [payload.value]);

  const measuredRef = useCallback(
    node => {
      if (node === null) {
        return;
      }

      let { wordsByLines } = node.state;
      let biggestLine = wordsByLines.reduce((a, b) => (a.width > b.width ? a : b));
      let tempText = text;
      const tempSuffix = wordsByLines.length > maxLines || biggestLine.width > rest.width
        ? '…'
        : '';

      while (wordsByLines.length > maxLines || biggestLine.width > rest.width) {
        tempText = tempText.slice(0, -1);
        wordsByLines = node.getWordsByLines(
          {
            ...rest,
            children: tempText + tempSuffix
          },
          true
        );
        biggestLine = wordsByLines.reduce((a, b) => (a.width > b.width ? a : b));
      }

      if (tempText !== text) {
        setText(tempText);
        setSuffix(tempSuffix);
      }
    },
    [maxLines, rest, text]
  );

  return (
    <g>
      <Text {...rest} ref={measuredRef}>
        {text + suffix}
      </Text>
      <title>{payload.value}</title>
    </g>
  );
}
