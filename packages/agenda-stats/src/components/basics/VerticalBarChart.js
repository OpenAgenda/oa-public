import React from 'react';
// import { useIntl } from 'react-intl';
import {
  XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart
} from 'recharts';
import defaultDataColors from '../../common/defaultDataColors';
// import addRestItem from '../../utils/addRestItem';
import CustomTooltip from './CustomTooltip';
import EllipsisAxisTick from './EllipsisAxisTick';

export default function VerticalBarChart({
  data,
  // total,
  dataKey,
  labelKey,
  renderTooltipItem,
  categoryTick
}) {
  return (
    <BarChart
      layout="vertical"
      width={400}
      height={42 + data.length * 50}
      data={data}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis
        type="number"
        // interval="preserveStartEnd"
        allowDecimals={false}
      />
      <YAxis
        dataKey={labelKey}
        type="category"
        width={100}
        // interval="preserveStartEnd"
        tick={categoryTick || <EllipsisAxisTick maxLines={3} />}
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
          xAxisId={0}
        />
      ))}
    </BarChart>
  );
}
