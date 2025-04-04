import { Heading, Grid, Box, Text } from '@openagenda/uikit';
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
}: ModularSetProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      <Heading
        fontSize={fontSize?.name || '4xl'}
        as="h2"
        size="xl"
        textAlign="center"
        color={color(titleColor)}
      >
        {title}
      </Heading>
      {description && (
        <Text
          fontSize="xl"
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
        gap={8}
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
        {Components.map((Component) => (
          <Box
            key={Component.id}
            justifyContent="center"
            display="flex"
            flexGrow={Component.grow || 0}
            flexBasis={0}
          >
            <Modular
              {...Component}
              verticalAlign={verticalAlign}
              grow={Component.grow}
              width={Component.grow ? undefined : width}
            />
          </Box>
        ))}
      </Box>
      {CTA ? (
        <Grid templateColumns="1fr" justifyItems="center" w="full">
          <CTAButton {...CTA} />
        </Grid>
      ) : null}
    </SegmentContainer>
  );
}
