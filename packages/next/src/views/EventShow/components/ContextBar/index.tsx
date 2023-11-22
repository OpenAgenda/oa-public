import { useRouter } from 'next/router';
import { chakra, Box, SimpleGrid, Collapse, Icon, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faList } from 'icons/regular';
import base64 from 'utils/base64';
import useEvent from '../../hooks/useEvent';
import StateSelector from './StateSelector';
import ContextBarButton from './ContextBarButton';

const Column = chakra(Box, {
  baseStyle: {
    bg: 'primary.500',
    // flex: '1',
    h: '50px',
    // flexBasis: ['100%', null, 'auto'],
  },
});

export default function ContextBar({ agenda }) {
  const router = useRouter();
  const { event } = useEvent();

  const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
  const url = new URL(localePrefix + router.asPath, 'http://n');
  const currentUrl = url.pathname + url.search;

  return (
    <Collapse in animateOpacity>
      <SimpleGrid columns={{ sm: 1, md: 4 }} bg="white" spacing="1px">
        <Column>
          <ContextBarButton
            sx={{
              '.list-icon': {
                opacity: 0.6,
                transitionProperty: 'opacity',
              },
              _hover: {
                '.list-icon': {
                  opacity: 1,
                },
                color: 'white',
                bgColor: 'primary.600',
              },
              _active: {
                '.list-icon': {
                  opacity: 1,
                },
                color: 'white',
                bgColor: 'primary.600',
              },
            }}
            rightIcon={(
              <Icon
                className="list-icon"
                as={FaIcon}
                icon={faList}
                size="2xl"
                // opacity="0.4"
                // _hover={{ opacity: 1 }}
              />
            )}
          >
            Retour à la gestion des événements
          </ContextBarButton>
        </Column>
        <Column>
          <StateSelector agenda={agenda} />
        </Column>
        <Column>
          <ContextBarButton
            as={Link}
            href={`/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`}
            _hover={{
              textDecoration: 'none',
              bgColor: 'primary.600',
            }}
          >
            Modifier
          </ContextBarButton>
        </Column>
        <Column>
          Colonne 4
        </Column>
      </SimpleGrid>
    </Collapse>
  );
}
