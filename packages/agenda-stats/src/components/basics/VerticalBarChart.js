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

export default function VerticalBarChart({
  data,
  dataKey,
  labelKey,
  renderTooltipItem,
}) {
  return (
    <ResponsiveContainer width="100%" height={42 + data.length * 46}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
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
            activeBar
            dataKey={k}
            isAnimationActive={false}
            barSize={18}
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
    </ResponsiveContainer>
  );
}
