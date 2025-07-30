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
  className?: string;
  colorVariant?: string;
}

export default function SegmentContainer({
  children,
  backgroundColor,
  colorVariant = 'subtle',
  fontColor,
  title,
  description,
  CTAs,
  className,
}: SegmentContainerProps) {
  return (
    <chakra.div
      className={className}
      backgroundColor={
        backgroundColor?.name === 'white'
          ? backgroundColor.name
          : backgroundColor
            ? [color(`${backgroundColor?.name}`), colorVariant].join('.')
            : null
      }
    >
      <Container
        maxW="7xl"
        color={fontColor ? color(fontColor.name) : undefined}
        py="24"
      >
        {title && (
          <H2 mb={description ? 6 : 16} fontWeight="bold" textAlign="center">
            {title}
          </H2>
        )}
        {description && (
          <Heading size="md" textAlign="center" color="gray.600" mb={16}>
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
