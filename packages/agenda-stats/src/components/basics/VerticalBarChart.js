import React, { useMemo } from 'react';
// import { useIntl } from 'react-intl';
import {
  XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart
} from 'recharts';
import { css } from '@emotion/core';
import dataColors from '../../common/dataColors';
import mergeMultiData from '../../utils/mergeMultiData';
// import addRestItem from '../../utils/addRestItem';
import CustomTooltip from './CustomTooltip';
import EllipsisAxisTick from './EllipsisAxisTick';

export default function VerticalBarChart({
  data: rawData,
  // total,
  dataKey,
  fromDataKey,
  labelKey,
  renderTooltipItem
  // withRest,
  // noValueRest
}) {
  // const intl = useIntl();
  // const data = useMemo(() => {
  //   const result = rawData;
  //
  //   if (withRest) {
  //     result = addRestItem(rawData, total, intl, noValueRest);
  //   }
  //
  //   return rawData;
  // }, [rawData, total, intl, withRest, noValueRest]);
  const data = useMemo(() => {
    if (!fromDataKey?.length) {
      return rawData;
    }

    return mergeMultiData(rawData, fromDataKey, dataKey);
  }, [fromDataKey, dataKey, rawData]);

  return (
    <BarChart
      layout="vertical"
      width={400}
      height={42 + data.length * 50}
      data={data}
      css={css`
        .recharts-surface {
          overflow: visible;
        }
      `}
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
        tick={<EllipsisAxisTick maxLines={3} />}
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
          xAxisId={0}
        />
      ))}
    </BarChart>
  );
}
