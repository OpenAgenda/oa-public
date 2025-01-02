import {
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  Image,
} from '@openagenda/uikit';
import CTAButton from './CTAButton';

export default function Modular({ title, description, image, CTA }) {
  return (
    <Card maxW="sm">
      <CardBody>
        <VStack spacing="3" align="center">
          {image ? (
            <Image
              src={`${image.url}`}
              alt={image.alternativeText}
              borderRadius="full"
              boxSize={20}
            />
          ) : null}
          {title ? (
            <Heading size="md" textAlign="center">
              {title}
            </Heading>
          ) : null}
          {description ? <Text>{description}</Text> : null}
          {CTA ? <CTAButton {...CTA} /> : null}
        </VStack>
      </CardBody>
    </Card>
  );
}
