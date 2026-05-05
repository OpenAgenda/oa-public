import { chakra, Flex, Grid, GridItem } from '@openagenda/uikit';

export default function ContentGrid({ total, events, filters }) {
  return (
    <Grid
      templateAreas={{
        base: `"filters"
               "total"
               "events"`,
        lg: `"total ."
             "events filters"`,
      }}
      templateColumns={{
        base: '1fr',
        lg: '2fr minmax(380px, 1fr)',
      }}
      rowGap="8"
      columnGap={{ xl: '24' }}
      pt="8"
      m="auto"
      maxW="7xl"
    >
      <GridItem area="total">
        <Flex direction="row" gap="8">
          <chakra.div
            w={{ base: 'full', xl: '25%' }}
            display={{ base: 'none', xl: 'block' }}
          />
          <Flex
            gap="6"
            direction="column"
            w={{ base: 'full', xl: '75%' }}
            px={{ base: '4', xl: '0' }}
          >
            {total}
          </Flex>
        </Flex>
      </GridItem>

      <GridItem area="filters">{filters}</GridItem>

      <GridItem area="events">{events}</GridItem>
    </Grid>
  );
}
