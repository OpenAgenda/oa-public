import React, { useMemo } from 'react';
// import { useIntl } from 'react-intl';
import {
  XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart
} from 'recharts';
import { css } from '@emotion/core';
// import addRestItem from '../../utils/addRestItem';
import mergeMultiData from '../../utils/mergeMultiData';
import dataColors from '../../common/dataColors';
import CustomTooltip from './CustomTooltip';
import EllipsisAxisTick from './EllipsisAxisTick';

export default function HorizontalBarChart({
  data: rawData,
  // total,
  dataKey,
  fromDataKey,
  labelKey,
  renderTooltipItem,
  xAxisTick,
  yAxisTick
}) {
  // const intl = useIntl();
  const data = useMemo(() => {
    if (!fromDataKey?.length) {
      return rawData;
    }

    return mergeMultiData(rawData, fromDataKey, dataKey);
  }, [fromDataKey, dataKey, rawData]);

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
      {[].concat(dataKey).map((k, i) => (
        <Bar
          key={k}
          type="monotone"
          dataKey={k}
          stroke={dataColors[i] || dataColors[dataColors.length - 1]}
          fillOpacity={1}
          fill={dataColors[i] || dataColors[dataColors.length - 1]}
          yAxisId={0}
        />
      ))}
    </BarChart>
  );
}
