import { Heading, Grid } from '@openagenda/uikit';
import Modular from './Modular';
import SegmentContainer from './SegmentContainer';
import CTAButton from './CTAButton';

export default function ModularSet({ title, Components, CTA }) {
  return (
    <SegmentContainer>
      <Heading as="h2" size="xl" textAlign="center">
        {title}
      </Heading>
      <Grid
        templateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap={8}
        p={8}
      >
        {Components.map((Component) => (
          <Modular key={Component.id} {...Component} />
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
