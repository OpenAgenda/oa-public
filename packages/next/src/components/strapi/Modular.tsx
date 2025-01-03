import { Card, CardBody, VStack, Heading, Text } from '@openagenda/uikit';
import CTAButton from './CTAButton';
import IllustrationComponent from './Illustration';

const Wrapper = ({ children, card }) => {
  if (!card) {
    return <>{children}</>;
  }
  return (
    <Card maxW="sm">
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
}) {
  return (
    <Wrapper card={card}>
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
