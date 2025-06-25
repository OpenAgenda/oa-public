import { Container, chakra, H2, Heading, Box } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import type { Color } from './types';
import CTAButtons from './CTAButtons';

interface SegmentContainerProps {
  children: React.ReactNode;
  backgroundColor?: Color;
  fontColor?: Color;
  title?: string;
  description?: string;
  CTAs?: any[];
}

export default function SegmentContainer({
  children,
  backgroundColor,
  fontColor,
  title,
  description,
  CTAs,
}: SegmentContainerProps) {
  return (
    <chakra.div
      backgroundColor={
        backgroundColor ? `${backgroundColor?.name}.solid` : null
      }
    >
      <Container
        maxW="7xl"
        color={fontColor ? color(fontColor) : undefined}
        py="24"
      >
        {title && (
          <H2 mb={description ? 6 : 16} fontWeight="bold" textAlign="center">
            {title}
          </H2>
        )}
        {description && (
          <Heading size="md" textAlign="center" color="gray.600" mb={6}>
            {description}
          </Heading>
        )}
        {children}
        {CTAs && CTAs.length > 0 && (
          <Box mt="12">
            <CTAButtons CTAs={CTAs} justify="center" />
          </Box>
        )}
      </Container>
    </chakra.div>
  );
}
