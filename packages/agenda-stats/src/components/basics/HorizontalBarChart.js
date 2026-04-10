import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  BarChart,
  ResponsiveContainer,
} from 'recharts';
import defaultDataColors from '../../common/defaultDataColors.js';
import useIsPrinting from '../../hooks/useIsPrinting.js';
import CustomTooltip from './CustomTooltip.js';
import EllipsisAxisTick from './EllipsisAxisTick.js';

const tooltipWrapperStyle = { zIndex: 1000 };

export default function HorizontalBarChart({
  data,
  // total,
  dataKey,
  labelKey,
  renderTooltipItem,
  categoryTick,
}) {
  const isPrinting = useIsPrinting();
  const chartMargin = isPrinting
    ? { top: 0, right: 5, left: 0, bottom: 0 }
    : undefined;

  return (
    <ResponsiveContainer width="100%" height={isPrinting ? 150 : 300}>
      <BarChart data={data} barGap={0} margin={chartMargin}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis
          dataKey={labelKey}
          type="category"
          // interval="preserveStartEnd"
          tick={categoryTick || <EllipsisAxisTick />}
        />
        <YAxis
          type="number"
          // interval="preserveStartEnd"
          allowDecimals={false}
        />
        <Tooltip
          wrapperStyle={tooltipWrapperStyle}
          content={
            <CustomTooltip dataKey={labelKey} renderItem={renderTooltipItem} />
          }
        />
        {[].concat(dataKey).map((k, i) => (
          <Bar
            key={k}
            type="monotone"
            dataKey={k}
            barSize={isPrinting ? 10 : undefined}
            stroke={
              defaultDataColors[i]
              || defaultDataColors[defaultDataColors.length - 1]
            }
            fillOpacity={1}
            fill={
              defaultDataColors[i]
              || defaultDataColors[defaultDataColors.length - 1]
            }
            yAxisId={0}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
