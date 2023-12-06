import { useRouter } from 'next/router';
import {
  chakra,
  VStack,
  HStack,
  Text,
  Link,
  Textarea,
  Button,
  UnorderedList,
  ListItem,
} from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faFacebookF, faXTwitter, faLinkedinIn } from 'icons/brands';

export default function OtherShares({ contentLocale }) {
  const router = useRouter();

  const eventUrl = `${process.env.NEXT_PUBLIC_ROOT}${router.asPath}?cl=${contentLocale}`;

  return (
    <VStack align="stretch" spacing="6">
      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          Partager sur les réseaux sociaux
        </Text>
        <HStack>
          <Button
            as={Link}
            variant="outline"
            href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(eventUrl)}`}
            isExternal
            colorScheme="primary"
            leftIcon={<FaIcon icon={faFacebookF} />}
          >
            Facebook
          </Button>
          <Button
            as={Link}
            variant="outline"
            href="https://twitter.com"
            isExternal
            colorScheme="primary"
            leftIcon={<FaIcon icon={faXTwitter} />}
          >
            Twitter
          </Button>
          <Button
            as={Link}
            variant="outline"
            href="https://linkedin.com"
            isExternal
            colorScheme="primary"
            leftIcon={<FaIcon icon={faLinkedinIn} />}
          >
            LinkedIn
          </Button>
        </HStack>
      </div>

      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          Partager par email
        </Text>
        <Textarea
          mb="2"
          placeholder="Veuillez saisir les addresses email auxquelles vous souhaiter envoyer l'événement"
        />
        <Button
          type="submit"
          colorScheme="primary"
        >
          Envoyer
        </Button>
      </div>

      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          Importer dans un calendrier personnel
        </Text>
        <UnorderedList>
          <ListItem>
            <Link colorScheme="primary" href="https://oa.com">
              Google Calendar
            </Link>
          </ListItem>
          <ListItem>
            <Link colorScheme="primary" href="https://oa.com">
              Yahoo! Calendar
            </Link>
          </ListItem>
          <ListItem>
            <Link colorScheme="primary" href="https://oa.com">
              Windows Live
            </Link>
          </ListItem>
          <ListItem>
            <Link colorScheme="primary" href="https://oa.com">
              ICS
            </Link>
          </ListItem>
        </UnorderedList>
      </div>

      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          Partager le lien
        </Text>
        <chakra.div
          py="1"
          ps="4"
          border="1px"
          borderColor="gray.300"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          {process.env.NEXT_PUBLIC_ROOT + router.asPath}
          <Button
            colorScheme="primary"
            variant="outline"
            size="sm"
            mx="1"
            onClick={() => {}}
          >
            Copier
          </Button>
        </chakra.div>
      </div>
    </VStack>
  );
}
