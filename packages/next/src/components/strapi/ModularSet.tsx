import { Heading, Grid, Box, Text, HeadingProps } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import Modular from './Modular';
import SegmentContainer from './SegmentContainer';
import CTAButton from './CTAButton';

interface Color {
  name: string;
  swatch?: string;
}

interface ModularSetProps {
  title: string;
  description?: string;
  Components: Array<any>;
  CTA?: any;
  backgroundColor?: string;
  fontColor?: string;
  verticalAlign?: 'center' | 'stretch' | 'flex-start';
  titleColor?: Color;
  descriptionColor?: Color;
  justifyContent?: 'left' | 'center' | 'right';
  fontSize?: { name: string };
  width?: { name: string };
  margin?: { name: string };
}

export default function ModularSet({
  title,
  description,
  Components,
  CTA,
  backgroundColor,
  verticalAlign,
  fontColor,
  titleColor,
  descriptionColor,
  justifyContent,
  fontSize,
  width,
  margin,
}: ModularSetProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      <Heading
        // fontSize={fontSize?.name || '4xl'}
        as="h2"
        size={(fontSize?.name || 'xl') as HeadingProps['size']}
        textAlign="center"
        color={color(titleColor)}
        fontWeight={600}
      >
        {title}
      </Heading>
      {description && (
        <Text
          fontSize="lg"
          textAlign="center"
          mt={4}
          mb={2}
          color={color(descriptionColor)}
        >
          {description}
        </Text>
      )}
      <Box
        display="flex"
        py={8}
        mx="auto"
        flexWrap="wrap"
        alignItems={
          verticalAlign === 'center'
            ? 'center'
            : verticalAlign === 'stretch'
              ? 'stretch'
              : 'flex-start'
        }
        justifyContent={
          justifyContent === 'left'
            ? 'flex-start'
            : justifyContent === 'right'
              ? 'flex-end'
              : 'center'
        }
      >
        {Components.map((Component, index) => {
          const isLast = index === Components.length - 1;

          return (
            <Box
              key={Component.id}
              justifyContent="center"
              display="flex"
              flexGrow={Component.grow || 0}
              flexBasis={0}
              mr={isLast ? 0 : { base: 0, md: margin?.name ?? '2%' }}
            >
              <Modular
                {...Component}
                verticalAlign={verticalAlign}
                grow={Component.grow}
                width={Component.grow ? undefined : width}
              />
            </Box>
          );
        })}
      </Box>
      {CTA ? (
        <Grid templateColumns="1fr" justifyItems="center" w="full">
          <CTAButton {...CTA} />
        </Grid>
      ) : null}
    </SegmentContainer>
  );
}
