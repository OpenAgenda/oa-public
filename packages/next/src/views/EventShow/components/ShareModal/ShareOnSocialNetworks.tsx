import { useIntl } from 'react-intl';
import { Button, HStack, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faFacebookF, faLinkedinIn, faXTwitter } from 'icons/brands';
import AccordionItem from 'components/AccordionItem';
import { shareModal as messages } from '../../messages';

export default function ShareOnSocialNetworks({
  eventUrl,
  event,
  contentLocale,
}) {
  const intl = useIntl();

  return (
    <AccordionItem
      value="social"
      title={intl.formatMessage(messages.shareOnSocialNetworks)}
    >
      <HStack>
        <Button asChild variant="outline">
          <Link
            unstyled
            href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(eventUrl.toString())}`}
            target="_blank"
            rel="noopener nofollow"
          >
            <FaIcon icon={faFacebookF} />
            Facebook
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            unstyled
            href={`https://twitter.com/share?url=${encodeURIComponent(eventUrl.toString())}`}
            target="_blank"
            rel="noopener nofollow"
          >
            <FaIcon icon={faXTwitter} />
            Twitter
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            unstyled
            href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl.toString())}&title=${encodeURIComponent(event.title[contentLocale])}&summary=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}&source=${eventUrl}`}
            target="_blank"
            rel="noopener nofollow"
          >
            <FaIcon icon={faLinkedinIn} />
            LinkedIn
          </Link>
        </Button>
      </HStack>
    </AccordionItem>
  );
}
