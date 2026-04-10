import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  BarChart,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import defaultDataColors from '../../common/defaultDataColors.js';
import useIsPrinting from '../../hooks/useIsPrinting.js';
import CustomTooltip from './CustomTooltip.js';

const tooltipWrapperStyle = { zIndex: 1000 };

const CategoryLabel = ({ x, y, value }) => (
  <text
    x={x}
    y={y}
    textAnchor="start"
    dominantBaseline="baseline"
    fontSize={12}
    fill="#333"
  >
    {value}
  </text>
);

const PRINT_CHART_WIDTH = 340;

export default function VerticalBarChart({
  data,
  dataKey,
  labelKey,
  renderTooltipItem,
}) {
  const isPrinting = useIsPrinting();
  const rowHeight = isPrinting ? 30 : 46;
  const height = 42 + data.length * rowHeight;
  const chartMargin = isPrinting
    ? { top: 14, right: 16, left: 16, bottom: 8 }
    : { top: 16, right: 16, left: 16, bottom: 16 };

  const chart = (
    <BarChart
      layout="vertical"
      data={data}
      margin={chartMargin}
      width={isPrinting ? PRINT_CHART_WIDTH : undefined}
      height={isPrinting ? height : undefined}
    >
      <CartesianGrid stroke="#f5f5f5" />

      <XAxis type="number" allowDecimals={false} />

      <YAxis
        dataKey={labelKey}
        type="category"
        width={0}
        tick={false}
        axisLine={false}
        tickLine={false}
        padding={isPrinting ? { top: 0, bottom: 0 } : undefined}
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
          dataKey={k}
          isAnimationActive={false}
          barSize={isPrinting ? 6 : 18}
          stroke={
            defaultDataColors[i]
            || defaultDataColors[defaultDataColors.length - 1]
          }
          fill={
            defaultDataColors[i]
            || defaultDataColors[defaultDataColors.length - 1]
          }
          style={{ transform: 'translateY(6px)' }}
        >
          {i === 0 && (
            <LabelList dataKey={labelKey} content={<CategoryLabel />} />
          )}
        </Bar>
      ))}
    </BarChart>
  );

  if (isPrinting) {
    return chart;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chart}
    </ResponsiveContainer>
  );
}
