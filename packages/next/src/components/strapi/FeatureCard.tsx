import { Card, CardBody, Stack, Heading, Text, Image } from '@openagenda/uikit';

export default function FeatureCard({ title, text, image, assetsBasePath }) {
  return (
    <Card maxW='sm'>
      <CardBody>
        <Image
          src={`${assetsBasePath}${image.url}`}
          alt={title}
          borderRadius='lg'
        />
        <Stack mt='6' spacing='3'>
          <Heading size='md'>{title}</Heading>
          <Text>
            {text}
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}


