import { Heading, Grid, GridItem, Text } from '@openagenda/uikit';
import Modular from './Modular';
import SegmentContainer from './SegmentContainer';
import CTAButton from './CTAButton';

export default function ModularSet({
  title,
  description,
  Components,
  CTA,
  backgroundColor,
  fontColor,
}) {
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
      <Grid
        templateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap={8}
        p={8}
        justifyItems="center"
        alignItems="center"
      >
        {Components.map((Component) => (
          <GridItem key={Component.id} w="full" justifyItems="center">
            <Modular {...Component} />
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
