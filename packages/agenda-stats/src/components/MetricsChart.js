import React from 'react';
import { useIntl } from 'react-intl';
import ContentLoader from 'react-content-loader';
import { css } from '@emotion/react';
import form from '../messages/form';

function ChartLoading() {
  return (
    <ContentLoader
      speed={2}
      style={{ width: '100%' }}
      height={210}
      viewBox="0 0 400 210"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <rect x="0" y="20" rx="5" ry="5" width="90" height="14" />
      <rect x="0" y="62" rx="5" ry="5" width="90" height="14" />
      <rect x="0" y="104" rx="5" ry="5" width="90" height="14" />
      <rect x="0" y="146" rx="5" ry="5" width="90" height="14" />
      <rect x="102" y="10" rx="5" ry="5" width="280" height="32" />
      <rect x="102" y="52" rx="5" ry="5" width="175" height="32" />
      <rect x="102" y="94" rx="5" ry="5" width="100" height="32" />
      <rect x="102" y="136" rx="5" ry="5" width="40" height="32" />
    </ContentLoader>
  );
}

export default function MetricsChart({ stat }) {
  const { state, aggregation } = stat;
  const { data } = state;

  const intl = useIntl();

  if (!data) {
    return <ChartLoading />;
  }

  const metrics = aggregation.metrics
    || (data && Object.keys(data)[0]) || ['avg'];

  return (
    <div style={{ width: '100%', heigth: 300 }}>
      {metrics.length === 1 ? (
        <>
          <div
            className="text-center"
            css={css`
              font-size: 6rem;
              font-weight: 300;
              line-height: 1.2;
            `}
          >
            {intl.formatNumber(data[metrics[0]], { maximumFractionDigits: 2 })}
          </div>
          <div className="text-center">
            {intl.formatMessage(form[metrics[0]])}
          </div>
        </>
      ) : null}
      {metrics.length > 1 ? (
        <>
          <div>
            <table className="table">
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric}>
                    <td>{intl.formatMessage(form[metric])}</td>
                    <td className="text-right">
                      {intl.formatNumber(data[metric], {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
