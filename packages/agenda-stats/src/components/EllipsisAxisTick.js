import React, { useCallback, useState } from 'react';
import { Text } from 'recharts';

export default function EllipsisAxisTick({ maxLines = 3, payload, ...rest }) {
  const [text, setText] = useState(payload.value);
  const [suffix, setSuffix] = useState('');

  const measuredRef = useCallback(
    node => {
      if (node === null) {
        return;
      }

      let numberOfLines = node.state.wordsByLines.length;
      let tempText = text;
      const tempSuffix = numberOfLines > maxLines ? '…' : '';

      while (numberOfLines > maxLines) {
        tempText = tempText.slice(0, -1);
        numberOfLines = node.getWordsByLines(
          {
            ...rest,
            children: tempText + tempSuffix
          },
          true
        ).length;
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
