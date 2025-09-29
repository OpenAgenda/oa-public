import { useIntl } from 'react-intl';
import { Icon, Link, HStack, VStack } from '@openagenda/uikit';
import { faGithub, faBluesky, faLinkedin, faDailymotion } from 'icons/brands';
import { FaIcon } from 'icons';

import messages from './messages';

export default function FollowUsLinks({ fontColor }) {
  const intl = useIntl();

  return (
    <VStack alignItems="left" gap={3}>
      <Link
        color={fontColor}
        href="mailto:contact@openagenda.com"
        aria-label={intl.formatMessage(messages.contactEmail)}
        target="_blank"
        rel="noopener nofollow"
        style={{ marginRight: '1rem' }}
      >
        contact@openagenda.com
      </Link>
      <HStack gap={4}>
        {[
          {
            key: 'github',
            icon: faGithub,
            href: 'https://github.com/openagenda',
            title: intl.formatMessage(messages.github),
          },
          {
            key: 'bluesky',
            icon: faBluesky,
            href: 'https://bsky.app/profile/openagenda.com',
            title: intl.formatMessage(messages.bluesky),
          },
          {
            key: 'linkedin',
            icon: faLinkedin,
            href: 'https://www.linkedin.com/company/openagenda',
            title: intl.formatMessage(messages.linkedin),
          },
          {
            key: 'dailymotion',
            icon: faDailymotion,
            href: 'https://www.dailymotion.com/OpenAgenda',
            title: intl.formatMessage(messages.dailymotion),
          },
        ].map(({ icon, key, href, title }) => (
          <Link
            title={title}
            aria-label={title}
            key={key}
            href={href}
            target="_blank"
            rel="noopener nofollow"
          >
            <Icon color={fontColor} _hover={{ color: 'primary.500' }}>
              <FaIcon size="lg" icon={icon} />
            </Icon>
          </Link>
        ))}
      </HStack>
    </VStack>
  );
}
