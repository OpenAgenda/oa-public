import { Box, Grid, GridItem, Stack, Heading, Text } from '@openagenda/uikit';
import CTAButton from './CTAButton';
import Illustration from './Illustration';

interface PageHeadProps {
  title: string;
  description: string;
  cta: {
    label: string;
    link: string;
  };
  illustration: {
    url: string;
    alternativeText?: string;
  };
}

export default function PageHead({
  title,
  description,
  cta,
  illustration,
}: PageHeadProps) {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
      gap={8}
      alignItems="center"
      py={12}
    >
      <GridItem>
        <Stack spacing={6}>
          <Heading as="h1" size="2xl">
            {title}
          </Heading>
          <Text fontSize="xl" color="gray.600">
            {description}
          </Text>
          <Box pt={4}>
            <CTAButton label={cta.label} link={cta.link} />
          </Box>
        </Stack>
      </GridItem>
      <GridItem>
        <Illustration image={illustration} />
      </GridItem>
    </Grid>
  );
}
