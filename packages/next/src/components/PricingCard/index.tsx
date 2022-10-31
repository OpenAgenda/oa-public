import {
  Box,
  VStack,
  Flex,
  Heading,
  List,
  ListItem,
  Image,
  Button,
  Text,
  chakra,
} from '@openagenda/uikit';

import AgendaSVG from './agenda.svg';
import NetworkSVG from './network.svg';
import AgendaPlusSVG from './agenda-plus.svg';

const visuals = {
  agenda: { svg: AgendaSVG, width: 50, height: 50 },
  agendaPlus: { svg: AgendaPlusSVG, width: 80, height: 50 },
  network: { svg: NetworkSVG, width: 80, height: 70 },
};

const UnicodeCheck = () => (<chakra.i role="presentation" marginEnd={2} fontWeight="bold" color="primary.500">✓</chakra.i>);

export default function PricingCard({
  name,
  HeadingComponent,
  cost,
  features,
  before = null,
  visual,
  ...props
}) {
  return (
    <Box
      position="relative"
      pb="6"
      maxW="md"
      width="100%"
      {...props}
    >
      <VStack spacing={6} bg="white" color="white" borderTopRadius="lg" pt="8">
        <Image
          alt=""
          src={visuals[visual].svg.src}
          width={visuals[visual].width}
          height={visuals[visual].height}
        />
        {name ? (
          <Heading size="xl" color="black">
            {name}
          </Heading>
        ) : null}
        {HeadingComponent ? <HeadingComponent /> : null}
      </VStack>
      <Flex align="flex-end" fontSize="xl" justify="center" pt="4" pb="2" bg="white" color="primary.400" fontWeight="bold">
        {cost}
      </Flex>
      {before ? (
        <Flex bg="white" px="8" py="4" fontSize="xl" align="center" direction="column">
          <Text pb="6">{before}</Text>
          <Text fontWeight="bold">avec en plus:</Text>
        </Flex>
      ) : null}
      <List spacing="4" bg="white" pt="4" pb="4" pl="8" pr="8">
        {features.map(({ label, key }) => (
          <ListItem fontSize="xl" key={key}>
            <UnicodeCheck />
            {label}
          </ListItem>
        ))}
      </List>
      <Flex align="stretch" fontSize="xl" justify="center" pt="4" pb="8" bg="white" color="primary.400" fontWeight="bold" borderBottomRadius="lg">
        <Button colorScheme="primary" size="lg">Créer un agenda</Button>
      </Flex>
    </Box>
  );
}
