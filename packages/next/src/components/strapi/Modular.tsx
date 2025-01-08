import { Card, CardBody, VStack, Heading, Text, Box } from '@openagenda/uikit';
import CTAButton from './CTAButton';
import IllustrationComponent from './Illustration';

const Wrapper = ({ children, card, maxWidth = 'sm' }) => {
  if (!card) {
    return <Box maxW={maxWidth}>{children}</Box>;
  }
  return (
    <Card maxW={maxWidth}>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

export default function Modular({
  title,
  description,
  Illustration,
  CTA,
  card,
  maxWidth = 'sm',
}) {
  return (
    <Wrapper card={card} maxWidth={maxWidth}>
      <VStack spacing="3" align="center">
        {Illustration ? <IllustrationComponent {...Illustration} /> : null}
        {title ? (
          <Heading size="md" textAlign="center">
            {title}
          </Heading>
        ) : null}
        {description ? <Text>{description}</Text> : null}
        {CTA ? <CTAButton {...CTA} /> : null}
      </VStack>
    </Wrapper>
  );
}
