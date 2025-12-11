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
  invertedColors?: boolean;
}

export default function OfficialAgenda({
  tooltipProps,
  invertedColors = false,
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
      <span role="img" aria-label={intl.formatMessage(messages.officialAgenda)}>
        <Icon
          {...props}
          css={{
            '--fa-primary-color': invertedColors
              ? 'white'
              : 'colors.primary.500',
            '--fa-secondary-color': invertedColors
              ? 'colors.primary.500'
              : 'white',
            '--fa-primary-opacity': '1',
            '--fa-secondary-opacity': '1',
          }}
        >
          <FontAwesomeIcon icon={faBadgeCheck} />
        </Icon>
      </span>
    </Tooltip>
  );
}
