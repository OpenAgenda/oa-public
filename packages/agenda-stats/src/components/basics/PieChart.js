import {
  PieChart as BasePieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import defaultDataColors from '../../common/defaultDataColors.js';
import useIsPrinting from '../../hooks/useIsPrinting.js';
import CustomTooltip from './CustomTooltip.js';

const tooltipWrapperStyle = { zIndex: 1000 };

const NULL_FILLS = ['#fafafa', '#c6c6c6'];

const labelProps = {
  fill: '#666',
};
const labelLineProps = {
  stroke: '#666',
};

function isNullFill(fill) {
  return NULL_FILLS.includes((fill || '').toLowerCase());
}

function makePrintLabel(data, colors) {
  return (props) => {
    const { x, y, textAnchor, value, index } = props;
    const entry = data[index] || {};
    const fill = entry.color || colors[index];
    const isNull = isNullFill(fill);
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill="#333"
        fontWeight={isNull ? 'normal' : 'bold'}
        dominantBaseline="central"
      >
        {value}
      </text>
    );
  };
}

export default function PieChart({
  data,
  // total,
  dataKey,
  labelKey,
  renderTooltipItem,
  dataColors,
}) {
  const colors = dataColors || defaultDataColors;
  const isPrinting = useIsPrinting();
  const printLabel = isPrinting ? makePrintLabel(data, colors) : null;

  return (
    <ResponsiveContainer width="100%" height={isPrinting ? 200 : 450}>
      <BasePieChart>
        <Pie
          dataKey={dataKey}
          nameKey={labelKey}
          data={data}
          innerRadius={33}
          isAnimationActive={false}
          label={printLabel || labelProps}
          labelLine={labelLineProps}
          startAngle={-270} // start to top
        >
          {data.map((entry, index) => {
            const fill = entry.color || colors[index];
            const isNullSlice = isNullFill(fill);
            return (
              <Cell
                key={`cell-${entry.key}`}
                fill={isPrinting && isNullSlice ? 'transparent' : fill}
                stroke={isPrinting && isNullSlice ? 'none' : undefined}
              />
            );
          })}
        </Pie>
        <Tooltip
          wrapperStyle={tooltipWrapperStyle}
          content={
            <CustomTooltip dataKey={labelKey} renderItem={renderTooltipItem} />
          }
        />
      </BasePieChart>
    </ResponsiveContainer>
  );
}
