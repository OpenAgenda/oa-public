import { H2, Heading, Box, Flex } from '@openagenda/uikit';
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
  additionalTopPadding?: string | number;
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
    <Box backgroundImage={getBackgroundImage(background)}>
      <Flex
        maxW={fullWidth ? '100%' : '7xl'}
        minH={{ base: fullHeight ? '100vh' : undefined }}
        color={fontColor ? color(fontColor.name, 500) : undefined}
        py={fullWidth ? 0 : 20}
        px={fullWidth ? 0 : undefined}
        mx="auto"
        direction="column"
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
        <Flex flex="1" justifyContent="center" direction="column">
          {children}
        </Flex>
        {CTAs && CTAs.length > 0 && (
          <Box mt="12">
            <CTAButtons CTAs={CTAs} justify="center" />
          </Box>
        )}
      </Flex>
    </Box>
  );
}
