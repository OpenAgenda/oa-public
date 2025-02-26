import { Heading, Grid, GridItem, Text } from '@openagenda/uikit';
import Modular from './Modular';
import SegmentContainer from './SegmentContainer';
import CTAButton from './CTAButton';

interface ModularSetProps {
  title: string;
  description?: string;
  Components: Array<any>;
  CTA?: any;
  backgroundColor?: string;
  fontColor?: string;
  alignHeight?: boolean;
}

export default function ModularSet({
  title,
  description,
  Components,
  CTA,
  backgroundColor,
  fontColor,
  alignHeight,
}: ModularSetProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      <Heading as="h2" size="xl" textAlign="center">
        {title}
      </Heading>
      {description && (
        <Text textAlign="center" mt={4} mb={2}>
          {description}
        </Text>
      )}
      <Grid display="flex" gap={8} p={8} alignItems="stretch">
        {Components.map((Component) => (
          <GridItem
            key={Component.id}
            w="full"
            justifyItems="center"
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
