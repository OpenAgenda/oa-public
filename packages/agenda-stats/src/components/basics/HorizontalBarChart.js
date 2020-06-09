import React from 'react';
import {
  XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart
} from 'recharts';
import defaultDataColors from '../../common/defaultDataColors';
import CustomTooltip from './CustomTooltip';
import EllipsisAxisTick from './EllipsisAxisTick';

export default function HorizontalBarChart({
  data,
  // total,
  dataKey,
  labelKey,
  renderTooltipItem,
  categoryTick
}) {
  return (
    <BarChart
      width={400}
      height={450}
      data={data}
      barGap={0}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis
        dataKey={labelKey}
        type="category"
        // interval="preserveStartEnd"
        tick={categoryTick || <EllipsisAxisTick maxLines={3} />}
      />
      <YAxis
        type="number"
        // interval="preserveStartEnd"
        allowDecimals={false}
      />
      <Tooltip
        content={
          <CustomTooltip dataKey={labelKey} renderItem={renderTooltipItem} />
        }
      />
      {[].concat(dataKey).map((k, i) => (
        <Bar
          key={k}
          type="monotone"
          dataKey={k}
          stroke={defaultDataColors[i] || defaultDataColors[defaultDataColors.length - 1]}
          fillOpacity={1}
          fill={defaultDataColors[i] || defaultDataColors[defaultDataColors.length - 1]}
          yAxisId={0}
        />
      ))}
    </BarChart>
  );
}
