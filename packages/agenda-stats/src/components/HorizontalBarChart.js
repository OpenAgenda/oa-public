import React from 'react';
// import { useIntl } from 'react-intl';
import {
  XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart
} from 'recharts';
import { css } from '@emotion/core';
// import addRestItem from '../utils/addRestItem';
import CustomTooltip from './CustomTooltip';
import EllipsisAxisTick from './EllipsisAxisTick';

export default function HorizontalBarChart({
  data,
  // total,
  dataKey,
  dataKey1,
  labelKey,
  renderTooltipItem,
  xAxisTick,
  yAxisTick
}) {
  // const intl = useIntl();
  // const data = useMemo(() => addRestItem(rawData, total, intl), [rawData, total, intl]);

  return (
    <BarChart
      width={400}
      height={450}
      data={data}
      css={css`
        .recharts-surface {
          overflow: visible;
        }
      `}
      barGap={0}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis
        dataKey={labelKey}
        type="category"
        // interval="preserveStartEnd"
        width={100}
        tick={xAxisTick || <EllipsisAxisTick maxLines={3} />}
      />
      <YAxis
        type="number"
        // interval="preserveStartEnd"
        allowDecimals={false}
        tick={yAxisTick}
      />
      <Tooltip
        content={
          <CustomTooltip dataKey={labelKey} renderItem={renderTooltipItem} />
        }
      />
      <Bar
        type="monotone"
        dataKey={dataKey}
        stroke="#41acdd"
        fillOpacity={1}
        fill="#41acdd"
        yAxisId={0}
      />
      {dataKey1 ? (
        <Bar
          type="monotone"
          dataKey={dataKey1}
          stroke="#82ca9d"
          fillOpacity={1}
          fill="#82ca9d"
          yAxisId={0}
        />
      ) : null}
    </BarChart>
  );
}
