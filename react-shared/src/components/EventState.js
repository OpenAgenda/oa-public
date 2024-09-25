import { css } from '@emotion/react';
import { useIntl } from 'react-intl';
import cn from 'classnames';
import messages from '@openagenda/common-labels/event/states';
import MoreInfo from './MoreInfo';

const states = [
  {
    code: -1,
    slug: 'refused',
    badge: 'badge-danger',
  },
  {
    code: 0,
    slug: 'toModerate',
    badge: 'badge-default',
  },
  {
    code: 1,
    slug: 'readyToPublish',
    badge: 'badge-warning',
  },
  {
    code: 2,
    slug: 'published',
    badge: 'badge-success',
  },
];

export default function EventState({ value, displayLabel = true }) {
  const intl = useIntl();
  const { slug, badge } = states.find(
    (s) => value === s.slug || parseInt(value, 10) === s.code,
  );

  return (
    <>
      <MoreInfo content={intl.formatMessage(messages[slug])}>
        <span
          className={cn('badge', badge, { 'margin-right-xs': displayLabel })}
          css={css`
            height: 19px;
            width: 19px;
            vertical-align: baseline;
            cursor: pointer;
          `}
        >
          &nbsp;
        </span>
      </MoreInfo>
      {displayLabel ? intl.formatMessage(messages[slug]) : null}
    </>
  );
}
