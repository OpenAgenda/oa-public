import React, { useReducer, useMemo, useCallback } from 'react';
import distinctColors from 'distinct-colors';
import {
  PieChart, Pie, Legend, Tooltip, Cell
} from 'recharts';
import { css } from '@emotion/core';
import CustomTooltip from './CustomTooltip';

function addColorsToData(data) {
  const colors = distinctColors({
    count: data.length
  });
  return data.map((v, i) => ({ ...v, color: colors[i] }));
}

function legendOpacityInit(data) {
  return {
    colors: data.reduce(
      (accu, entry) => ({ ...accu, [entry.key]: entry.color }),
      {}
    ),
    opacity: data.reduce((accu, entry) => ({ ...accu, [entry.key]: 1 }), {})
  };
}

function legendOpacityReducer(state, action) {
  switch (action.type) {
    case 'mouseEnter':
      return {
        ...state,
        opacity: {
          ...Object.keys(state.opacity).reduce(
            (accu, key) => ({ ...accu, [key]: 0.45 }),
            {}
          ),
          [action.key]: 1
        }
      };
    case 'mouseLeave':
      return {
        ...state,
        opacity: {
          ...Object.keys(state.opacity).reduce(
            (accu, key) => ({ ...accu, [key]: 1 }),
            {}
          )
        }
      };
    default:
      return state;
  }
}

export default function OriginAgendasChart({ data }) {
  const dataWithColors = useMemo(() => addColorsToData(data), [data]);
  const [legendOpacityState, legendOpacityDispatch] = useReducer(
    legendOpacityReducer,
    dataWithColors,
    legendOpacityInit
  );

  const handleMouseEnter = useCallback(
    o => legendOpacityDispatch({
      type: 'mouseEnter',
      key: o.payload.key
    }),
    [legendOpacityDispatch]
  );
  const handleMouseLeave = useCallback(
    o => legendOpacityDispatch({
      type: 'mouseLeave',
      dataKey: o.payload.key
    }),
    [legendOpacityDispatch]
  );

  return (
    <PieChart width={400} height={400}>
      <Pie
        dataKey="eventCount"
        nameKey="agenda.title"
        data={dataWithColors}
        innerRadius={33}
        isAnimationActive={false}
        label
        labelLine
      >
        {data.map(entry => (
          <Cell
            key={`cell-${entry.key}`}
            fill={legendOpacityState.colors[entry.key]}
            fillOpacity={legendOpacityState.opacity[entry.key]}
            strokeOpacity={legendOpacityState.opacity[entry.key]}
          />
        ))}
      </Pie>
      <Tooltip
        contentStyle={css`
          margin: 0;
          padding: 6px;
          background-color: #fff;
          border: 1px solid #ccc;
          white-space: nowrap;

          & ul.recharts-tooltip-item-list {
            padding: 0;
            margin: 0;
            list-style-type: none;
          }
        `}
        content={(
          <CustomTooltip
            renderItem={entry => (
              <li
                key={`tooltip-item-${entry.key}`}
                className="recharts-tooltip-item"
              >
                <span>
                  <b>{entry.name}</b>
                  <br />
                  {entry.value} événements {entry.color}
                </span>
              </li>
            )}
          />
        )}
      />
      <Legend onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
    </PieChart>
  );
}
