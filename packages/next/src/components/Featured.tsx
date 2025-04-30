import { defineMessages, useIntl } from 'react-intl';
import { Text } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/pro-solid-svg-icons';

const messages = defineMessages({
  featured: {
    id: 'next.views.AgendaShow.EventItem.featured',
    defaultMessage: 'Featured',
  },
});

interface FeaturedProps {
  featured?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function Featured({ featured, size = 'md' }: FeaturedProps) {
  const intl = useIntl();

  if (!featured) {
    return null;
  }

  // Map size prop to fontSize and icon size
  const fontSizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  };

  return (
    <Text mb="2" fontSize={fontSizeMap[size]}>
      <FontAwesomeIcon icon={faThumbtack} />
      &nbsp;
      {intl.formatMessage(messages.featured)}
    </Text>
  );
}

export default Featured;
