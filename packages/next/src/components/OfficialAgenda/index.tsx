import { useIntl, defineMessages } from 'react-intl';
import { Icon, IconProps } from '@openagenda/uikit';
import { Tooltip, TooltipProps } from '@openagenda/uikit/snippets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBadgeCheck } from '@fortawesome/pro-duotone-svg-icons';

const messages = defineMessages({
  officialAgenda: {
    id: 'next.components.OfficialAgenda.officialAgenda',
    defaultMessage: 'Official agenda',
  },
});

export interface OfficialAgendaProps extends IconProps {
  tooltipProps?: Omit<TooltipProps, 'children' | 'content'>;
}

export default function OfficialAgenda({
  tooltipProps,
  ...props
}: OfficialAgendaProps) {
  const intl = useIntl();

  return (
    <Tooltip
      content={intl.formatMessage(messages.officialAgenda)}
      positioning={{ placement: 'right' }}
      showArrow
      contentProps={{
        css: { '--tooltip-bg': 'white' },
        color: 'black',
      }}
      openDelay={0}
      closeDelay={0}
      // arrowSize={8}
      // arrowPadding={6}
      {...tooltipProps}
    >
      <Icon
        aria-label={intl.formatMessage(messages.officialAgenda)}
        {...props}
        css={{
          '--fa-primary-color': 'white',
          '--fa-secondary-color': 'colors.oaBlue.500',
          '--fa-primary-opacity': '1',
          '--fa-secondary-opacity': '1',
        }}
      >
        <FontAwesomeIcon icon={faBadgeCheck} />
      </Icon>
    </Tooltip>
  );
}
