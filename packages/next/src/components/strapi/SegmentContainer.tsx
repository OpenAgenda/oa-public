import { Container, chakra, H2, Heading, Box } from '@openagenda/uikit';
import { color, getBackgroundImage } from 'utils/strapi';
import type { Color } from './types';
import CTAButtons from './CTAButtons';

interface SegmentContainerProps {
  children: React.ReactNode;
  background?: any;
  fontColor?: Color;
  descriptionColor?: Color;
  title?: string;
  description?: string;
  CTAs?: any[];
  colorVariant?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  additionalTopPadding: any;
}

export default function SegmentContainer({
  children,
  background,
  fontColor,
  descriptionColor,
  title,
  description,
  CTAs,
  fullWidth = false,
  fullHeight = false,
  additionalTopPadding,
}: SegmentContainerProps) {
  return (
    <chakra.div backgroundImage={getBackgroundImage(background)}>
      <Container
        maxW={fullWidth ? '100%' : '7xl'}
        height={{ base: fullHeight ? '100vh' : undefined }}
        minH={{ base: fullHeight ? '100vh' : undefined }}
        color={fontColor ? color(fontColor.name, 500) : undefined}
        py={fullWidth ? 0 : 20}
        px={fullWidth ? 0 : undefined}
      >
        {additionalTopPadding ? (
          <Box height={additionalTopPadding}></Box>
        ) : null}
        {title && (
          <H2 mb={description ? 6 : 16} fontWeight="bold" textAlign="center">
            {title}
          </H2>
        )}
        {description && (
          <Heading
            size="md"
            textAlign="center"
            color={
              descriptionColor || fontColor
                ? color(descriptionColor || fontColor, 500)
                : 'gray.600'
            }
            fontWeight={descriptionColor ? 'bold' : 'regular'}
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
