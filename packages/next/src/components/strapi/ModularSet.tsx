import { Heading, Grid, GridItem, Text } from '@openagenda/uikit';
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
  alignHeight?: boolean;
  titleColor?: Color;
  descriptionColor?: Color;
  minColumnWidth?: string;
  justifyContent?: 'left' | 'center' | 'right';
}

export default function ModularSet({
  title,
  description,
  Components,
  CTA,
  backgroundColor,
  alignHeight,
  fontColor,
  titleColor,
  descriptionColor,
  minColumnWidth,
  justifyContent,
}: ModularSetProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      <Heading as="h2" size="xl" textAlign="center" color={color(titleColor)}>
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
      <Grid
        display="grid"
        gridTemplateColumns={`repeat(auto-fit, minmax(${minColumnWidth || '250px'}, 1fr))`}
        gap={8}
        p={8}
        alignItems="stretch"
        mx="auto"
        justifyContent={
          justifyContent === 'left'
            ? 'start'
            : justifyContent === 'right'
              ? 'end'
              : 'center'
        }
      >
        {Components.map((Component) => (
          <GridItem
            key={Component.id}
            w="full"
            justifyContent="center"
            display="flex"
            flex={Component.grow || 1}
          >
            <Modular {...Component} alignHeight={alignHeight} />
          </GridItem>
        ))}
      </Grid>
      {CTA ? (
        <Grid templateColumns="1fr" justifyItems="center" w="full">
          <CTAButton {...CTA} />
        </Grid>
      ) : null}
    </SegmentContainer>
  );
}
