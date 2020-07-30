import React from 'react';
import { LineChart, Line, YAxis } from 'recharts';
import { useQuery } from 'react-query';
import subYears from 'date-fns/subYears';
import { useApiClient } from '@openagenda/react-shared';

const defaultData = [];
const yAxisDomain = [0, dataMax => Math.max(10, dataMax)];

export default function PulseChart({ agendaUid, className }) {
  const apiClient = useApiClient();

  const { data } = useQuery(['AgendaStats.PulseChart', agendaUid], async () => {
    const now = new Date();
    const startOfPastYear = subYears(now, 1);

    return (
      await apiClient.get(
        `https://d.openagenda.com/agendas/${agendaUid}/admin/events.v2.json`,
        {
          params: {
            oaq: {
              passed: 1
            },
            size: 0,
            aggregations: [
              {
                key: 'pulse',
                interval: 'week',
                type: 'createdOrUpdatedAt'
              }
            ],
            date: {
              gte: startOfPastYear,
              lte: now
            }
          }
        }
      )
    ).data?.aggregations?.pulse;
  });

  return (
    <LineChart
      width={155}
      height={30}
      data={data || defaultData}
      className={className}
    >
      <defs>
        <linearGradient
          id="colorUv"
          x1="0"
          x2="0"
          y1="30" // height
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="10%" stopColor="#9be9a8" />
          <stop offset="33%" stopColor="#40c463" />
          <stop offset="66%" stopColor="#30a14e" />
          <stop offset="90%" stopColor="#216e39" />
        </linearGradient>
      </defs>
      <YAxis type="number" domain={yAxisDomain} hide />
      <Line
        type="monotone"
        dataKey="eventCount"
        fill="green"
        stroke="url(#colorUv) #9be9a8"
        strokeWidth={2}
        dot={false}
        activeDot={false}
        isAnimationActive={false}
      />
    </LineChart>
  );
}
