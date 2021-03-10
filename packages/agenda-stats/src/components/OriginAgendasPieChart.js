import React, {
  useReducer,
  useMemo,
  useCallback,
  useLayoutEffect,
} from 'react';
import distinctColors from 'distinct-colors';
import { useIntl } from 'react-intl';
import {
  PieChart, Pie, Legend, Tooltip, Cell
} from 'recharts';
import addRestItem from '../utils/addRestItem';
import CustomTooltip from './basics/CustomTooltip';

const tooltipWrapperStyle = { zIndex: 1000 };

function addColorsToData(data) {
  const colors = distinctColors({
    count: data.length,
  });
  return data.map((v, i) => ({ ...v, color: colors[i] }));
}

function legendOpacityInit(data) {
  return {
    colors: data.reduce(
      (accu, entry) => ({ ...accu, [entry.key]: entry.color }),
      {}
    ),
    opacity: data.reduce((accu, entry) => ({ ...accu, [entry.key]: 1 }), {}),
  };
}

function legendOpacityReducer(state, action) {
  switch (action.type) {
    case 'init':
      return legendOpacityInit(action.data);
    case 'mouseEnter':
      return {
        ...state,
        opacity: {
          ...Object.keys(state.opacity).reduce(
            (accu, key) => ({ ...accu, [key]: 0.45 }),
            {}
          ),
          [action.key]: 1,
        },
      };
    case 'mouseLeave':
      return {
        ...state,
        opacity: {
          ...Object.keys(state.opacity).reduce(
            (accu, key) => ({ ...accu, [key]: 1 }),
            {}
          ),
        },
      };
    default:
      return state;
  }
}

export default function OriginAgendasPieChart({ data: rawData, total }) {
  const intl = useIntl();
  const data = useMemo(
    () => addColorsToData(addRestItem(rawData, total, intl)),
    [rawData, total, intl]
  );

  const [legendOpacityState, legendOpacityDispatch] = useReducer(
    legendOpacityReducer,
    data,
    legendOpacityInit
  );

  const [renderCount, forceUpdate] = useReducer(x => x + 1, 0);

  useLayoutEffect(() => {
    legendOpacityDispatch({
      type: 'init',
      data,
    });
  }, [data, legendOpacityDispatch]);

  useLayoutEffect(() => {
    forceUpdate();
  }, [data, forceUpdate]);

  const handleMouseEnter = useCallback(
    o => legendOpacityDispatch({
      type: 'mouseEnter',
      key: o.payload.key,
    }),
    [legendOpacityDispatch]
  );
  const handleMouseLeave = useCallback(
    o => legendOpacityDispatch({
      type: 'mouseLeave',
      key: o.payload.key,
    }),
    [legendOpacityDispatch]
  );

  return (
    <PieChart width={400} height={400} key={renderCount}>
      <Pie
        dataKey="eventCount"
        nameKey="agenda.title"
        data={data}
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
        wrapperStyle={tooltipWrapperStyle}
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
                  {entry.value} événements
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
