import { Container, chakra, H2, Heading, Box } from '@openagenda/uikit';
import { color, getBackgroundImage } from 'utils/strapi';
import type { Color } from './types';
import CTAButtons from './CTAButtons';

interface SegmentContainerProps {
  children: React.ReactNode;
  background?: any;
  fontColor?: Color;
  title?: string;
  description?: string;
  CTAs?: any[];
  colorVariant?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
}

export default function SegmentContainer({
  children,
  background,
  fontColor,
  title,
  description,
  CTAs,
  fullWidth = false,
  fullHeight = false,
}: SegmentContainerProps) {
  return (
    <chakra.div backgroundImage={getBackgroundImage(background)}>
      <Container
        maxW={fullWidth ? '100%' : '7xl'}
        height={{ md: fullHeight ? '100vh' : undefined }}
        color={fontColor ? color(fontColor.name, 500) : undefined}
        py={fullWidth ? 0 : 24}
        px={fullWidth ? 0 : undefined}
      >
        {title && (
          <H2 mb={description ? 6 : 16} fontWeight="bold" textAlign="center">
            {title}
          </H2>
        )}
        {description && (
          <Heading
            size="md"
            textAlign="center"
            color={fontColor ? color(fontColor, 500) : 'gray.600'}
            mb={16}
          >
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
