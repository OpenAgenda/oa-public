import { Card, CardBody, VStack, Heading, Box } from '@openagenda/uikit';
import ReactMarkdown from 'react-markdown';
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
}) {
  return (
    <Wrapper
      card={card}
      maxWidth={maxWidth?.name}
      bg={
        backgroundColor
          ? `${backgroundColor?.name}.${backgroundColor.swatch}`
          : undefined
      }
    >
      <VStack spacing="3" align="center">
        {Icon ? <IconComponent {...Icon} /> : null}
        {Illustration ? <IllustrationComponent {...Illustration} /> : null}
        {title ? (
          <Heading size="md" textAlign="center">
            {title}
          </Heading>
        ) : null}
        {description ? <ReactMarkdown>{description}</ReactMarkdown> : null}
        {CTA ? <CTAButton {...CTA} /> : null}
      </VStack>
    </Wrapper>
  );
}
