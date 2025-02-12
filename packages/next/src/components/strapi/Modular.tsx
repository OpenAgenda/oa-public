import { Card, CardBody, VStack, Heading, Box } from '@openagenda/uikit';
import ReactMarkdown from 'react-markdown';
import { color } from 'utils/strapi';
import CTAButton from './CTAButton';
import IllustrationComponent from './Illustration';
import IconComponent from './Icon';

const Wrapper = ({ children, card, maxWidth = 'sm', bg, alignHeight }) => {
  if (!card) {
    return (
      <Box maxW={maxWidth} bg={bg} height={alignHeight && 'full'}>
        {children}
      </Box>
    );
  }
  return (
    <Card maxW={maxWidth} bg={bg} height={alignHeight && 'full'}>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

export default function Modular({
  title = null,
  description = null,
  Illustration = null,
  CTA = null,
  Icon = null,
  card = false,
  maxWidth = { name: 'sm' },
  backgroundColor = null,
  fontColor = null,
  fontSize = null,
  titleAlign = null,
  alignHeight = false,
}) {
  return (
    <Wrapper
      card={card}
      maxWidth={maxWidth?.name}
      bg={color(backgroundColor)}
      alignHeight={alignHeight}
    >
      <VStack
        spacing="3"
        align="center"
        textAlign="left"
        color={color(fontColor)}
        fontSize={fontSize?.name}
        height="full"
      >
        {Icon ? <IconComponent {...Icon} /> : null}
        {Illustration ? <IllustrationComponent {...Illustration} /> : null}
        <Box
          flex={1}
          width="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={4}
        >
          {title ? (
            <Heading textAlign={titleAlign} fontSize="160%">
              {title}
            </Heading>
          ) : null}
          {description ? (
            <Box width="full">
              <ReactMarkdown>{description}</ReactMarkdown>
            </Box>
          ) : null}
          {CTA ? <CTAButton {...CTA} /> : null}
        </Box>
      </VStack>
    </Wrapper>
  );
}
