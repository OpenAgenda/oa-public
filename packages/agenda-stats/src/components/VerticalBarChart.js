import React from 'react';
// import { useIntl } from 'react-intl';
import {
  XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart
} from 'recharts';
import { css } from '@emotion/core';
// import addRestItem from '../utils/addRestItem';
import CustomTooltip from './CustomTooltip';
import EllipsisAxisTick from './EllipsisAxisTick';

export default function VerticalBarChart({
  data,
  // total,
  dataKey,
  labelKey
}) {
  // const intl = useIntl();
  // const data = useMemo(() => addRestItem(rawData, total, intl), [rawData, total, intl]);

  return (
    <BarChart
      layout="vertical"
      width={400}
      height={20 + data.length * 50}
      data={data}
      css={css`
        .recharts-surface {
          overflow: visible;
        }
      `}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis type="number" interval="preserveStartEnd" allowDecimals={false} />
      <YAxis
        dataKey={labelKey}
        type="category"
        width={100}
        tick={<EllipsisAxisTick maxLines={3} />}
      />
      <Tooltip content={<CustomTooltip labelKey={labelKey} />} />
      <Bar
        type="monotone"
        dataKey={dataKey}
        stroke="#41acdd"
        fillOpacity={1}
        fill="#41acdd"
        yAxisId={0}
      />
    </BarChart>
  );
}
