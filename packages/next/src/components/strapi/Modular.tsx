import { Card, CardBody, VStack, Heading, Box } from '@openagenda/uikit';
import ReactMarkdown from 'react-markdown';
import { color } from 'utils/strapi';
import CTAButton from './CTAButton';
import IllustrationComponent from './Illustration';
import IconComponent from './Icon';

const Wrapper = ({ children, card, maxWidth = 'sm', bg }) => {
  if (!card) {
    return (
      <Box maxW={maxWidth} bg={bg}>
        {children}
      </Box>
    );
  }
  return (
    <Card maxW={maxWidth} bg={bg}>
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
}) {
  return (
    <Wrapper card={card} maxWidth={maxWidth?.name} bg={color(backgroundColor)}>
      <VStack
        spacing="3"
        align="center"
        textAlign="left"
        color={color(fontColor)}
        fontSize={fontSize?.name}
      >
        {Icon ? <IconComponent {...Icon} /> : null}
        {Illustration ? <IllustrationComponent {...Illustration} /> : null}
        {title ? (
          <Heading textAlign={titleAlign} fontSize="160%">
            {title}
          </Heading>
        ) : null}
        {description ? <ReactMarkdown>{description}</ReactMarkdown> : null}
        {CTA ? <CTAButton {...CTA} /> : null}
      </VStack>
    </Wrapper>
  );
}
