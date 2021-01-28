import React from 'react';
import { LineChart, Line, YAxis } from 'recharts';
import { useQuery } from 'react-query';
import subDays from 'date-fns/subDays';
import { useApiClient } from '@openagenda/react-shared';

const defaultData = [];
const yAxisDomain = [0, dataMax => Math.max(10, dataMax)];

export default function PulseChart({
  agendaUid,
  className,
  height = 30,
  width = 155,
}) {
  const apiClient = useApiClient();

  const { data } = useQuery(
    ['agenda-stats', 'pulseChart', agendaUid],
    async () => {
      const now = new Date();
      const startOfPastYear = subDays(now, 364);

      return (
        await apiClient.get(`/agendas/${agendaUid}/admin/events.v2.json`, {
          params: {
            oaq: {
              passed: 1,
            },
            size: 0,
            aggregations: [
              {
                key: 'pulse',
                type: 'createdOrUpdatedAt',
                fixedInterval: '7d',
                extendedBounds: {
                  min: startOfPastYear,
                  max: now,
                },
              },
            ],
            updatedAt: {
              gte: startOfPastYear,
              lte: now,
            },
          },
        })
      ).data?.aggregations?.pulse;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <LineChart
      width={width}
      height={height}
      data={data || defaultData}
      className={className}
    >
      <defs>
        <linearGradient
          id="colorUv"
          x1="0"
          x2="0"
          y1={height}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="10%" stopColor="#b0e6ff" />
          <stop offset="33%" stopColor="#69c2ed" />
          <stop offset="66%" stopColor="#41acdd" />
          <stop offset="90%" stopColor="#31a2d7" />
        </linearGradient>
      </defs>
      <YAxis type="number" domain={yAxisDomain} scale="sqrt" hide />
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
