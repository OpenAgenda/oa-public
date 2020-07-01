import React from 'react';
import {
  PieChart as BasePieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts';
import defaultDataColors from '../../common/defaultDataColors';
import CustomTooltip from './CustomTooltip';

const labelProps = {
  fill: '#666'
};
const labelLineProps = {
  stroke: '#666'
};

export default function PieChart({
  data,
  // total,
  dataKey,
  labelKey,
  renderTooltipItem,
  dataColors
}) {
  const colors = dataColors || defaultDataColors;

  return (
    <ResponsiveContainer width="100%" height={450}>
      <BasePieChart>
        <Pie
          dataKey={dataKey}
          nameKey={labelKey}
          data={data}
          innerRadius={33}
          isAnimationActive={false}
          label={labelProps}
          labelLine={labelLineProps}
          startAngle={-270} // start to top
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.key}`} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip
          content={
            <CustomTooltip dataKey={labelKey} renderItem={renderTooltipItem} />
          }
        />
      </BasePieChart>
    </ResponsiveContainer>
  );
}
